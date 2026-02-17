"use client";

import { useMemo, useState } from "react";
import { fetchTopicIntel, fetchYoutubeVideoMeta } from "@/lib/free-apis";
import { generateBrief, generateIdeaCards, ingestLearning, scorePackaging } from "@/lib/mock-data";
import type { CreativeBrief, IdeaCard, LearningInsight, ScoredPackage } from "@/lib/types";

export function CreatorDashboard() {
  const [channelId, setChannelId] = useState("UC-demo-channel");
  const [niche, setNiche] = useState("productivity");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncNote, setSyncNote] = useState("Not synced yet.");

  const [ideas, setIdeas] = useState<IdeaCard[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<IdeaCard | null>(null);
  const [packages, setPackages] = useState<ScoredPackage[]>([]);
  const [brief, setBrief] = useState<CreativeBrief | null>(null);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [topicSummary, setTopicSummary] = useState("");
  const [relatedTerms, setRelatedTerms] = useState<string[]>([]);
  const [videoMeta, setVideoMeta] = useState<{ title: string; authorName: string; thumbnailUrl: string } | null>(null);
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

  const defaultTitles = useMemo(() => {
    if (!selectedIdea) {
      return [];
    }
    return [
      selectedIdea.title,
      `${selectedIdea.title} (I tracked every result)`,
      `I tested if "${selectedIdea.title}" actually works`,
      `Most creators fail at this: ${selectedIdea.title}`,
      `${selectedIdea.title} - what nobody tells beginners`
    ];
  }, [selectedIdea]);

  const defaultThumbs = [
    "Before/After split with timer",
    "Face reaction + one bold metric",
    "Mistake crossed out + simple fix arrow"
  ];

  const run = async (label: string, fn: () => Promise<void>) => {
    setError(null);
    setLoading(label);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-8 grid gap-5">
      <section className="panel">
        <h2 className="text-lg font-semibold">1. Channel Sync</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex min-w-72 flex-col gap-1">
            <span className="text-sm">Channel ID</span>
            <input
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="rounded border border-black/15 px-3 py-2"
            />
          </label>
          <button
            className="rounded bg-moss px-4 py-2 font-semibold text-white disabled:opacity-60"
            disabled={!!loading}
            onClick={() =>
              run("sync", async () => {
                if (channelId.trim().length < 3) {
                  throw new Error("Channel ID looks too short.");
                }
                setSyncNote(`Connected channel placeholder: ${channelId}. Analytics sync requires backend OAuth.`);
              })
            }
          >
            Sync
          </button>
        </div>
        <p className="mt-3 text-xs text-black/70">{syncNote}</p>
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">2. Idea Engine</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex min-w-72 flex-col gap-1">
            <span className="text-sm">Niche</span>
            <input value={niche} onChange={(e) => setNiche(e.target.value)} className="rounded border border-black/15 px-3 py-2" />
          </label>
          <button
            className="rounded bg-ember px-4 py-2 font-semibold text-white disabled:opacity-60"
            disabled={!!loading}
            onClick={() =>
              run("ideas", async () => {
                const intel = await fetchTopicIntel(niche);
                setTopicSummary(intel.summary);
                setRelatedTerms(intel.relatedTerms);
                const nextIdeas = generateIdeaCards(niche, intel.relatedTerms);
                setIdeas(nextIdeas);
                setSelectedIdea(nextIdeas[0] ?? null);
                setPackages([]);
                setBrief(null);
              })
            }
          >
            Generate Ideas
          </button>
        </div>
        {topicSummary ? (
          <p className="mt-3 rounded border border-black/10 bg-black/[0.02] p-3 text-sm">
            <span className="font-medium">Topic context:</span> {topicSummary}
          </p>
        ) : null}
        {relatedTerms.length > 0 ? (
          <p className="mt-2 text-xs text-black/70">Related terms from free APIs: {relatedTerms.join(", ")}</p>
        ) : null}
        <ul className="mt-4 grid gap-2">
          {ideas.map((idea) => (
            <li key={idea.id}>
              <button
                className={`w-full rounded border px-3 py-2 text-left ${selectedIdea?.id === idea.id ? "border-moss bg-moss/10" : "border-black/10"}`}
                onClick={() => setSelectedIdea(idea)}
              >
                <p className="font-medium">{idea.title}</p>
                <p className="text-xs text-black/70">{idea.coreAudience}</p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">3. Packaging Lab</h2>
        <button
          className="mt-3 rounded bg-black px-4 py-2 font-semibold text-white disabled:opacity-60"
          disabled={!!loading || !selectedIdea}
          onClick={() =>
            run("packaging", async () => {
              if (!selectedIdea) {
                return;
              }
              const scored = scorePackaging(defaultTitles, defaultThumbs);
              setPackages(scored);
              setBrief(null);
            })
          }
        >
          Score Packaging
        </button>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {packages.map((p) => (
            <article key={`${p.title}-${p.thumbnailConcept}`} className="rounded border border-black/10 p-3">
              <p className="font-semibold">{p.title}</p>
              <p className="mt-1 text-sm">Thumbnail: {p.thumbnailConcept}</p>
              <p className="mt-2 text-sm">Score: {p.score.total}/10</p>
              <p className="mt-1 text-xs text-black/70">{p.rationale}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">4. Creative Brief</h2>
        <button
          className="mt-3 rounded bg-moss px-4 py-2 font-semibold text-white disabled:opacity-60"
          disabled={!!loading || !selectedIdea || packages.length === 0}
          onClick={() =>
            run("brief", async () => {
              if (!selectedIdea || packages.length === 0) {
                return;
              }
              const top = packages[0];
              const nextBrief = generateBrief(selectedIdea.title, `${top.title} | ${top.thumbnailConcept}`);
              setBrief(nextBrief);
            })
          }
        >
          Generate Brief
        </button>
        {brief ? (
          <div className="mt-4 rounded border border-black/10 p-3 text-sm">
            <p className="font-semibold">{brief.selectedIdeaTitle}</p>
            <p className="mt-2">{brief.selectedPackaging}</p>
            <p className="mt-3 font-medium">Hooks</p>
            <ul className="list-disc pl-5">
              {brief.hooks.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">5. Learning Loop</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex min-w-96 flex-col gap-1">
            <span className="text-sm">Published video URL</span>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="rounded border border-black/15 px-3 py-2"
            />
          </label>
          <button
            className="rounded bg-ember px-4 py-2 font-semibold text-white disabled:opacity-60"
            disabled={!!loading}
            onClick={() =>
              run("learning", async () => {
                const meta = await fetchYoutubeVideoMeta(videoUrl);
                setVideoMeta(meta);
                const note = meta
                  ? `Video: "${meta.title}" by ${meta.authorName}. Hook was stronger than expected, middle section lagged.`
                  : "Hook was stronger than expected, middle section lagged.";
                const nextInsights = ingestLearning(videoUrl, note);
                setInsights(nextInsights);
              })
            }
          >
            Ingest Learnings
          </button>
        </div>
        {videoMeta ? (
          <div className="mt-3 rounded border border-black/10 p-3 text-sm">
            <p className="font-medium">{videoMeta.title}</p>
            <p className="text-xs text-black/70">{videoMeta.authorName}</p>
            <img src={videoMeta.thumbnailUrl} alt={videoMeta.title} className="mt-2 h-24 rounded object-cover" />
          </div>
        ) : null}
        <ul className="mt-4 grid gap-2">
          {insights.map((insight) => (
            <li key={insight.id} className="rounded border border-black/10 p-3 text-sm">
              <p>{insight.lesson}</p>
              <p className="mt-1 text-xs text-black/70">Next action: {insight.actionForNextVideo}</p>
            </li>
          ))}
        </ul>
      </section>

      {loading ? <p className="text-sm text-black/70">Running: {loading}...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
