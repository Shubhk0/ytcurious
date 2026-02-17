"use client";

import { useEffect, useMemo, useState } from "react";
import {
  generateBriefInBrowser,
  generateHooksInBrowser,
  generateIdeaTitlesInBrowser,
  generateShotPlanInBrowser,
  isBrowserAISupported,
  warmupBrowserAI
} from "@/lib/browser-ai";
import { fetchTopicIntel, fetchYoutubeVideoMeta } from "@/lib/free-apis";
import {
  applyEmptyViewsFixes,
  assessEmptyViewsRisk,
  buildQuestionChain,
  generateBrief,
  generateHookOptions,
  generateIdeaCards,
  generateShotPlan,
  ideaCardsFromTitles,
  ingestLearning,
  scorePackaging
} from "@/lib/mock-data";
import type {
  CreativeBrief,
  EmptyViewsAssessment,
  IdeaCard,
  LearningInsight,
  PackagePerformanceLog,
  ScoredPackage,
  ShotPlanStep,
  WorkspaceSnapshot
} from "@/lib/types";
import { listWorkspaceSnapshots, saveWorkspaceSnapshot } from "@/lib/workspace-storage";

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
  const [preTitleAngle, setPreTitleAngle] = useState("");
  const [preThumbnailConcept, setPreThumbnailConcept] = useState("");
  const [preFirst15sHook, setPreFirst15sHook] = useState("");
  const [targetDurationMin, setTargetDurationMin] = useState(8);
  const [questionChain, setQuestionChain] = useState<string[]>([]);
  const [bestRiskScore, setBestRiskScore] = useState<number | null>(null);
  const [winningPackage, setWinningPackage] = useState<ScoredPackage | null>(null);
  const [snapshots, setSnapshots] = useState<WorkspaceSnapshot[]>([]);
  const [storageProvider, setStorageProvider] = useState<"justjson" | "local">("local");
  const [aiStatus, setAiStatus] = useState("Browser AI not loaded");
  const [browserAISupported] = useState(isBrowserAISupported());
  const [riskDelta, setRiskDelta] = useState<{ before: number; after: number } | null>(null);
  const [hookOptions, setHookOptions] = useState<string[]>([]);
  const [selectedHook, setSelectedHook] = useState("");
  const [scriptDraft, setScriptDraft] = useState("");
  const [shotPlan, setShotPlan] = useState<ShotPlanStep[]>([]);
  const [pickedPackageKey, setPickedPackageKey] = useState("");
  const [ctrPercent, setCtrPercent] = useState(0);
  const [retention30sPercent, setRetention30sPercent] = useState(0);
  const [packagePerformanceLog, setPackagePerformanceLog] = useState<PackagePerformanceLog[]>([]);

  const defaultTitles = useMemo(() => {
    if (!selectedIdea) {
      return [];
    }
    const generated = [
      preTitleAngle.trim() || selectedIdea.title,
      `${selectedIdea.title} (I tracked every result)`,
      `I tested if "${selectedIdea.title}" actually works`,
      `Most creators fail at this: ${selectedIdea.title}`,
      `${selectedIdea.title} - what nobody tells beginners`
    ];
    return generated;
  }, [selectedIdea, preTitleAngle]);

  const defaultThumbs = useMemo(
    () => [
      preThumbnailConcept.trim() || "Before/After split with timer",
      "Face reaction + one bold metric",
      "Mistake crossed out + simple fix arrow"
    ],
    [preThumbnailConcept]
  );

  const pickedPackage = useMemo(
    () => packages.find((pkg) => `${pkg.title}__${pkg.thumbnailConcept}` === pickedPackageKey) ?? null,
    [packages, pickedPackageKey]
  );

  const performanceSummary = useMemo(() => {
    if (packagePerformanceLog.length === 0) {
      return null;
    }
    const totalCtr = packagePerformanceLog.reduce((sum, item) => sum + item.ctrPercent, 0);
    const totalRetention = packagePerformanceLog.reduce((sum, item) => sum + item.retention30sPercent, 0);
    return {
      avgCtr: Number((totalCtr / packagePerformanceLog.length).toFixed(2)),
      avgRetention: Number((totalRetention / packagePerformanceLog.length).toFixed(2))
    };
  }, [packagePerformanceLog]);

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

  const emptyViewsAssessment: EmptyViewsAssessment = useMemo(
    () => assessEmptyViewsRisk(packages[0] ?? null, preFirst15sHook, questionChain),
    [packages, preFirst15sHook, questionChain]
  );

  useEffect(() => {
    void run("load snapshots", async () => {
      const result = await listWorkspaceSnapshots(10);
      setStorageProvider(result.provider);
      setSnapshots(result.snapshots);
    });
  }, []);

  useEffect(() => {
    if (packages.length === 0) {
      return;
    }
    if (bestRiskScore === null || emptyViewsAssessment.riskScore < bestRiskScore) {
      setBestRiskScore(emptyViewsAssessment.riskScore);
    }
  }, [emptyViewsAssessment.riskScore, packages, bestRiskScore]);

  const saveCurrentSnapshot = async () => {
    const result = await saveWorkspaceSnapshot({
      channelId,
      niche,
      preTitleAngle,
      preThumbnailConcept,
      preFirst15sHook,
      targetDurationMin,
      questionChain,
      bestRiskScore: bestRiskScore ?? undefined,
      winningPackage,
      ideas,
      selectedIdea,
      packages,
      brief,
      insights,
      videoUrl,
      hookOptions,
      selectedHook,
      scriptDraft,
      shotPlan,
      packagePerformanceLog
    });
    setStorageProvider(result.provider);
    setSnapshots((prev) => [result.snapshot, ...prev.filter((s) => s.id !== result.snapshot.id)].slice(0, 10));
  };

  const restoreSnapshot = (snapshot: WorkspaceSnapshot) => {
    setChannelId(snapshot.payload.channelId);
    setNiche(snapshot.payload.niche);
    setPreTitleAngle(snapshot.payload.preTitleAngle);
    setPreThumbnailConcept(snapshot.payload.preThumbnailConcept);
    setPreFirst15sHook(snapshot.payload.preFirst15sHook);
    setTargetDurationMin(snapshot.payload.targetDurationMin);
    setQuestionChain(snapshot.payload.questionChain);
    setBestRiskScore(snapshot.payload.bestRiskScore ?? null);
    setWinningPackage(snapshot.payload.winningPackage ?? null);
    setIdeas(snapshot.payload.ideas);
    setSelectedIdea(snapshot.payload.selectedIdea);
    setPackages(snapshot.payload.packages);
    setBrief(snapshot.payload.brief);
    setInsights(snapshot.payload.insights);
    setVideoUrl(snapshot.payload.videoUrl);
    setHookOptions(snapshot.payload.hookOptions ?? []);
    setSelectedHook(snapshot.payload.selectedHook ?? "");
    setScriptDraft(snapshot.payload.scriptDraft ?? "");
    setShotPlan(snapshot.payload.shotPlan ?? []);
    setPackagePerformanceLog(snapshot.payload.packagePerformanceLog ?? []);
    setSyncNote(`Restored snapshot ${new Date(snapshot.createdAt).toLocaleString()}`);
  };

  const explainPackage = (pkg: ScoredPackage) => {
    const reasons: string[] = [];
    if (pkg.score.clickPotential >= 8) reasons.push("strong click intent");
    if (pkg.score.respectTime >= 8) reasons.push("clear time promise");
    if (pkg.score.giveMore >= 8) reasons.push("high proof/value signal");
    if (pkg.score.curiosityGap >= 8) reasons.push("good curiosity tension");
    return reasons.length > 0 ? reasons.join(", ") : "balanced fundamentals";
  };

  return (
    <div className="dashboard-grid pb-8">
      <section className="panel">
        <h2 className="text-lg font-semibold">1. Channel Sync</h2>
        <div className="mt-3 grid gap-3 md:flex md:flex-wrap md:items-end">
          <label className="flex w-full flex-col gap-1 md:min-w-72 md:flex-1">
            <span className="text-sm">Channel ID</span>
            <input
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="input-base"
            />
          </label>
          <button
            className="btn-primary w-full md:w-auto"
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
        <p className="mt-3 text-xs muted">{syncNote}</p>
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">2. Idea Engine</h2>
        <div className="mt-3 grid gap-3 md:flex md:flex-wrap md:items-end">
          <label className="flex w-full flex-col gap-1 md:min-w-72 md:flex-1">
            <span className="text-sm">Niche</span>
            <input value={niche} onChange={(e) => setNiche(e.target.value)} className="input-base" />
          </label>
          <button
            className="btn-primary w-full md:w-auto"
            disabled={!!loading}
            onClick={() =>
              run("ideas", async () => {
                const intel = await fetchTopicIntel(niche);
                setTopicSummary(intel.summary);
                setRelatedTerms(intel.relatedTerms);
                const nextIdeas = generateIdeaCards(niche, intel.relatedTerms);
                setIdeas(nextIdeas);
                setSelectedIdea(nextIdeas[0] ?? null);
                const nextHooks = nextIdeas[0] ? generateHookOptions(nextIdeas[0].title, nextIdeas[0].coreAudience) : [];
                setHookOptions(nextHooks);
                setSelectedHook(nextHooks[0] ?? "");
                setPackages([]);
                setPickedPackageKey("");
                setBrief(null);
              })
            }
          >
            Generate Ideas
          </button>
          <button
            className="btn-secondary w-full text-sm md:w-auto"
            disabled={!!loading || !browserAISupported}
            onClick={() =>
              run("browser ai warmup", async () => {
                setAiStatus("Loading browser model (first run can take 20-60s)...");
                await warmupBrowserAI();
                setAiStatus("Browser AI ready");
              })
            }
          >
            Warmup Browser AI
          </button>
          <button
            className="btn-secondary w-full md:w-auto"
            disabled={!!loading || !browserAISupported}
            onClick={() =>
              run("browser ai ideas", async () => {
                setAiStatus("Loading browser model (first run can take time)...");
                const titles = await generateIdeaTitlesInBrowser(niche);
                const nextIdeas = ideaCardsFromTitles(niche, titles);
                setIdeas(nextIdeas);
                setSelectedIdea(nextIdeas[0] ?? null);
                const nextHooks = nextIdeas[0] ? generateHookOptions(nextIdeas[0].title, nextIdeas[0].coreAudience) : [];
                setHookOptions(nextHooks);
                setSelectedHook(nextHooks[0] ?? "");
                setPackages([]);
                setPickedPackageKey("");
                setBrief(null);
                setAiStatus("Browser AI ready");
              })
            }
          >
            Generate with Browser AI
          </button>
        </div>
        <p className="mt-2 text-xs muted">
          {browserAISupported ? aiStatus : "Browser AI unavailable on this device/browser. Using standard generation."}
        </p>
        {topicSummary ? (
          <p className="mt-3 rounded border border-black/10 bg-black/[0.02] p-3 text-sm">
            <span className="font-medium">Topic context:</span> {topicSummary}
          </p>
        ) : null}
        {relatedTerms.length > 0 ? (
          <p className="mt-2 text-xs muted">Related terms from free APIs: {relatedTerms.join(", ")}</p>
        ) : null}
        <ul className="mt-4 grid gap-2">
          {ideas.map((idea) => (
            <li key={idea.id}>
              <button
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${selectedIdea?.id === idea.id ? "border-moss bg-moss/10" : "border-black/10 bg-white hover:bg-black/[0.03]"}`}
                onClick={() => {
                  setSelectedIdea(idea);
                  const nextHooks = generateHookOptions(idea.title, idea.coreAudience);
                  setHookOptions(nextHooks);
                  setSelectedHook(nextHooks[0] ?? "");
                }}
              >
                <p className="font-medium">{idea.title}</p>
                <p className="text-xs text-black/70">{idea.coreAudience}</p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">2.5 Pre-Packaging Board</h2>
        <p className="mt-2 text-xs text-black/70">Lock packaging before production: angle, hook, and question chain.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Title Angle</span>
            <input
              value={preTitleAngle}
              onChange={(e) => setPreTitleAngle(e.target.value)}
              placeholder="Example: I tested 30-day productivity systems"
              className="input-base"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Thumbnail Concept</span>
            <input
              value={preThumbnailConcept}
              onChange={(e) => setPreThumbnailConcept(e.target.value)}
              placeholder="Example: Before/After desk setup with timer"
              className="input-base"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm">First 15s Hook</span>
            <input
              value={preFirst15sHook}
              onChange={(e) => setPreFirst15sHook(e.target.value)}
              placeholder="Example: I wasted 6 hours/day until I tested this system."
              className="input-base"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Target Duration (minutes)</span>
            <input
              value={targetDurationMin}
              type="number"
              min={3}
              max={60}
              onChange={(e) => setTargetDurationMin(Math.max(3, Math.min(60, Number(e.target.value) || 8)))}
              className="input-base"
            />
          </label>
          <div className="flex items-end">
            <button
              className="btn-secondary w-full text-sm md:w-auto"
              disabled={!selectedIdea || !!loading}
              onClick={() =>
                run("question chain", async () => {
                  if (!selectedIdea) {
                    return;
                  }
                  setQuestionChain(buildQuestionChain(selectedIdea.title));
                })
              }
            >
              Build Question Chain
            </button>
          </div>
        </div>
        <ul className="mt-4 list-disc pl-5 text-sm">
          {questionChain.map((q) => (
            <li key={q}>{q}</li>
          ))}
          {questionChain.length === 0 ? <li className="text-black/60">No question chain yet.</li> : null}
        </ul>
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">2.7 Hook Lab</h2>
        <p className="mt-2 text-xs text-black/70">Generate and lock a hook before drafting to improve first-30-second retention.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="btn-secondary text-sm"
            disabled={!selectedIdea || !!loading}
            onClick={() =>
              run("hooks", async () => {
                if (!selectedIdea) {
                  return;
                }
                const nextHooks = generateHookOptions(selectedIdea.title, selectedIdea.coreAudience);
                setHookOptions(nextHooks);
                setSelectedHook(nextHooks[0] ?? "");
              })
            }
          >
            Generate Hooks
          </button>
          <button
            className="btn-secondary text-sm"
            disabled={!selectedIdea || !!loading || !browserAISupported}
            onClick={() =>
              run("browser ai hooks", async () => {
                if (!selectedIdea) {
                  return;
                }
                setAiStatus("Generating hooks with browser AI...");
                const nextHooks = await generateHooksInBrowser(selectedIdea.title);
                setHookOptions(nextHooks);
                setSelectedHook(nextHooks[0] ?? "");
                setAiStatus("Browser AI ready");
              })
            }
          >
            Hooks with Browser AI
          </button>
        </div>
        <ul className="mt-4 grid gap-2">
          {hookOptions.map((hook) => (
            <li key={hook}>
              <button
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  selectedHook === hook ? "border-moss bg-moss/10" : "border-black/10 bg-white hover:bg-black/[0.03]"
                }`}
                onClick={() => setSelectedHook(hook)}
              >
                {hook}
              </button>
            </li>
          ))}
          {hookOptions.length === 0 ? <li className="text-sm text-black/60">No hooks yet. Generate a set first.</li> : null}
        </ul>
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">3. Packaging Lab</h2>
        <div className="mt-3 rounded border border-black/10 bg-black/[0.02] p-3 text-xs">
          <p className="font-semibold">Rules we score against</p>
          <p>1) If they do not click, they do not watch.</p>
          <p>2) Respect viewer time with clarity and pace.</p>
          <p>3) Give more value than expected to build durable audience.</p>
        </div>
        <button
          className="btn-primary mt-3 w-full md:w-auto"
          disabled={!!loading || !selectedIdea}
          onClick={() =>
            run("packaging", async () => {
              if (!selectedIdea) {
                return;
              }
                const scored = scorePackaging(defaultTitles, defaultThumbs);
                setPackages(scored);
                setPickedPackageKey(scored[0] ? `${scored[0].title}__${scored[0].thumbnailConcept}` : "");
                setBrief(null);
              })
            }
          >
          Score Packaging
        </button>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {packages.map((p) => {
            const packageKey = `${p.title}__${p.thumbnailConcept}`;
            const selected = packageKey === pickedPackageKey;
            return (
            <article
              key={`${p.title}-${p.thumbnailConcept}`}
              className={`rounded-xl border bg-white p-3 shadow-sm ${selected ? "border-moss" : "border-black/10"}`}
            >
              <p className="font-semibold">{p.title}</p>
              <p className="mt-1 text-sm">Thumbnail: {p.thumbnailConcept}</p>
              <p className="mt-2 text-sm">Score: {p.score.total}/10</p>
              <p className="mt-1 text-xs text-black/70">
                Click {p.score.clickPotential}/10 | Time {p.score.respectTime}/10 | Give More {p.score.giveMore}/10 |
                Curiosity Gap {p.score.curiosityGap}/10
              </p>
              <p className="mt-1 text-xs text-black/70">{p.rationale}</p>
              <ul className="mt-2 list-disc pl-4 text-xs text-black/70">
                {p.riskFlags.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-black/70">Why this pair can win: {explainPackage(p)}</p>
              <button className="btn-secondary mt-3 text-xs" onClick={() => setPickedPackageKey(packageKey)}>
                {selected ? "Picked Pair" : "Pick this Pair"}
              </button>
            </article>
            );
          })}
        </div>
        {pickedPackage ? (
          <div className="mt-4 rounded border border-black/10 bg-black/[0.02] p-3 text-sm">
            <p className="font-semibold">Picked title + thumbnail pair</p>
            <p className="mt-1">{pickedPackage.title}</p>
            <p className="text-xs text-black/70">Thumbnail: {pickedPackage.thumbnailConcept}</p>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">3.5 Empty Views Risk</h2>
        <div className="mt-3 grid gap-2 md:flex md:items-center md:gap-3">
          <span
            className={`rounded px-3 py-1 text-sm font-semibold ${
              emptyViewsAssessment.riskLabel === "High"
                ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200"
                : emptyViewsAssessment.riskLabel === "Medium"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
            }`}
          >
            {emptyViewsAssessment.riskLabel} Risk ({emptyViewsAssessment.riskScore}/10)
          </span>
          <button
            className="btn-secondary w-full text-sm md:w-auto"
            disabled={!selectedIdea || !!loading}
            onClick={() =>
              run("apply risk fixes", async () => {
                if (!selectedIdea) {
                  return;
                }
                const beforeRisk = emptyViewsAssessment.riskScore;
                const fixed = applyEmptyViewsFixes(
                  selectedIdea.title,
                  preTitleAngle,
                  preFirst15sHook,
                  questionChain,
                  emptyViewsAssessment
                );
                setPreTitleAngle(fixed.nextTitleAngle);
                setPreFirst15sHook(fixed.nextHook);
                setQuestionChain(fixed.nextQuestionChain);

                // Re-score immediately so users can see impact of one-click fixes.
                const nextTitles = [
                  fixed.nextTitleAngle.trim() || selectedIdea.title,
                  `${selectedIdea.title} (I tracked every result)`,
                  `I tested if "${selectedIdea.title}" actually works`,
                  `Most creators fail at this: ${selectedIdea.title}`,
                  `${selectedIdea.title} - what nobody tells beginners`
                ];
                const nextThumbs = [
                  preThumbnailConcept.trim() || "Before/After split with timer",
                  "Face reaction + one bold metric",
                  "Mistake crossed out + simple fix arrow"
                ];
                const rescored = scorePackaging(nextTitles, nextThumbs);
                setPackages(rescored);
              setPickedPackageKey(rescored[0] ? `${rescored[0].title}__${rescored[0].thumbnailConcept}` : "");
              const afterAssessment = assessEmptyViewsRisk(rescored[0] ?? null, fixed.nextHook, fixed.nextQuestionChain);
              setRiskDelta({ before: beforeRisk, after: afterAssessment.riskScore });
            })
          }
          >
            Apply Fixes
          </button>
          <button
            className="btn-secondary w-full text-sm md:w-auto"
            disabled={!packages[0] || !!loading}
            onClick={() =>
              run("save winning package", async () => {
                if (!packages[0]) {
                  return;
                }
                setWinningPackage(packages[0]);
                setBestRiskScore(emptyViewsAssessment.riskScore);
              })
            }
          >
            Save as Winning Package
          </button>
        </div>
        <p className="mt-3 text-sm font-medium">Why this score</p>
        <ul className="mt-1 list-disc pl-5 text-sm">
          {emptyViewsAssessment.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm font-medium">How to reduce risk</p>
        <ul className="mt-1 list-disc pl-5 text-sm">
          {emptyViewsAssessment.fixes.map((fix) => (
            <li key={fix}>{fix}</li>
          ))}
        </ul>
        {riskDelta ? (
          <p className="mt-3 text-sm font-medium">
            Risk delta after last fix: {riskDelta.before.toFixed(1)} to {riskDelta.after.toFixed(1)} (
            {(riskDelta.before - riskDelta.after).toFixed(1)} improvement)
          </p>
        ) : null}
        {bestRiskScore !== null ? <p className="mt-2 text-sm">Best risk this session: {bestRiskScore.toFixed(1)}/10</p> : null}
        {winningPackage ? (
          <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm">
            <p className="font-semibold">Winning Package</p>
            <p className="mt-1">{winningPackage.title}</p>
            <p className="text-xs text-black/70">Thumbnail: {winningPackage.thumbnailConcept}</p>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">4. Creative Brief</h2>
        <button
          className="btn-primary mt-3 w-full md:w-auto"
          disabled={!!loading || !selectedIdea || packages.length === 0}
          onClick={() =>
            run("brief", async () => {
              if (!selectedIdea || packages.length === 0) {
                return;
              }
              const top = packages[0];
              const nextBrief = generateBrief(
                selectedIdea.title,
                `${top.title} | ${top.thumbnailConcept}`,
                targetDurationMin,
                questionChain
              );
              setBrief(nextBrief);
            })
          }
        >
          Generate Brief
        </button>
        <button
          className="btn-secondary mt-3 w-full md:ml-3 md:w-auto"
          disabled={!!loading || !selectedIdea || packages.length === 0 || !browserAISupported}
          onClick={() =>
            run("browser ai brief", async () => {
              if (!selectedIdea || packages.length === 0) {
                return;
              }
              setAiStatus("Generating brief with browser AI...");
              const top = packages[0];
              const nextBrief = await generateBriefInBrowser(
                selectedIdea.title,
                `${top.title} | ${top.thumbnailConcept}`,
                targetDurationMin,
                questionChain
              );
              setBrief(nextBrief);
              setAiStatus("Browser AI ready");
            })
          }
        >
          Brief with Browser AI
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
            <p className="mt-3 font-medium">Question Chain</p>
            <ul className="list-disc pl-5">
              {brief.questionChain.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
            <p className="mt-3 font-medium">Retention Beats</p>
            <ul className="list-disc pl-5">
              {brief.retentionCheckpoints.map((cp) => (
                <li key={cp}>{cp}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">5. Script to Shot Planner</h2>
        <label className="mt-3 flex flex-col gap-1">
          <span className="text-sm">Script draft (one beat per line)</span>
          <textarea
            value={scriptDraft}
            onChange={(e) => setScriptDraft(e.target.value)}
            rows={6}
            className="input-base"
            placeholder="Hook line&#10;Problem + stakes&#10;Method&#10;Proof&#10;CTA"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="btn-primary text-sm"
            disabled={!!loading}
            onClick={() =>
              run("shot plan", async () => {
                const nextPlan = generateShotPlan(scriptDraft, targetDurationMin);
                setShotPlan(nextPlan);
              })
            }
          >
            Build Shot Plan
          </button>
          <button
            className="btn-secondary text-sm"
            disabled={!!loading || !browserAISupported || !selectedIdea}
            onClick={() =>
              run("browser ai shot plan", async () => {
                if (!selectedIdea) {
                  return;
                }
                setAiStatus("Generating shot plan with browser AI...");
                const lines = await generateShotPlanInBrowser(selectedIdea.title);
                setShotPlan(generateShotPlan(lines.join("\n"), targetDurationMin));
                setAiStatus("Browser AI ready");
              })
            }
          >
            Shot Plan with Browser AI
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {shotPlan.map((step) => (
            <article key={step.id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
              <p className="font-semibold">{step.beat}</p>
              <p className="mt-1">{step.objective}</p>
              <p className="mt-2 text-xs text-black/70">Primary shot: {step.primaryShot}</p>
              <p className="text-xs text-black/70">B-roll: {step.bRoll}</p>
              <p className="text-xs text-black/70">On-screen text: {step.onScreenText}</p>
              <p className="text-xs text-black/70">Edit note: {step.editNote}</p>
            </article>
          ))}
          {shotPlan.length === 0 ? <p className="text-sm text-black/60">No shot plan generated yet.</p> : null}
        </div>
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">6. Learning Loop</h2>
        <div className="mt-3 grid gap-3 md:flex md:flex-wrap md:items-end">
          <label className="flex w-full flex-col gap-1 md:min-w-96 md:flex-1">
            <span className="text-sm">Published video URL</span>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="input-base"
            />
          </label>
          <button
            className="btn-primary w-full md:w-auto"
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
        <div className="mt-3 rounded border border-black/10 bg-black/[0.02] p-3 text-sm">
          <p className="font-semibold">Pair Performance Logger</p>
          <p className="mt-1 text-xs text-black/70">Log actual results for your picked title + thumbnail + hook to improve next suggestions.</p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs">CTR %</span>
              <input
                type="number"
                min={0}
                max={100}
                value={ctrPercent}
                onChange={(e) => setCtrPercent(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="input-base"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs">30s retention %</span>
              <input
                type="number"
                min={0}
                max={100}
                value={retention30sPercent}
                onChange={(e) => setRetention30sPercent(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="input-base"
              />
            </label>
            <div className="flex items-end">
              <button
                className="btn-secondary w-full text-xs"
                disabled={!pickedPackage || !selectedHook}
                onClick={() => {
                  if (!pickedPackage || !selectedHook) {
                    return;
                  }
                  const nextLog: PackagePerformanceLog = {
                    id: Math.random().toString(36).slice(2, 10),
                    packageTitle: pickedPackage.title,
                    thumbnailConcept: pickedPackage.thumbnailConcept,
                    selectedHook,
                    ctrPercent,
                    retention30sPercent,
                    createdAt: new Date().toISOString()
                  };
                  setPackagePerformanceLog((prev) => [nextLog, ...prev].slice(0, 20));
                }}
              >
                Save Performance
              </button>
            </div>
          </div>
        </div>
        {videoMeta ? (
          <div className="mt-3 rounded border border-black/10 p-3 text-sm">
            <p className="font-medium">{videoMeta.title}</p>
            <p className="text-xs text-black/70">{videoMeta.authorName}</p>
            <img src={videoMeta.thumbnailUrl} alt={videoMeta.title} className="mt-2 h-24 rounded object-cover" />
          </div>
        ) : null}
        {performanceSummary ? (
          <p className="mt-3 text-sm font-medium">
            Avg performance from logged pairs: CTR {performanceSummary.avgCtr}% | 30s retention {performanceSummary.avgRetention}%
          </p>
        ) : null}
        <ul className="mt-3 grid gap-2">
          {packagePerformanceLog.slice(0, 5).map((item) => (
            <li key={item.id} className="rounded border border-black/10 p-3 text-sm">
              <p className="font-medium">{item.packageTitle}</p>
              <p className="text-xs text-black/70">Hook: {item.selectedHook}</p>
              <p className="text-xs text-black/70">
                CTR {item.ctrPercent}% | 30s retention {item.retention30sPercent}% | {new Date(item.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
        <ul className="mt-4 grid gap-2">
          {insights.map((insight) => (
            <li key={insight.id} className="rounded border border-black/10 p-3 text-sm">
              <p>{insight.lesson}</p>
              <p className="mt-1 text-xs text-black/70">Next action: {insight.actionForNextVideo}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">7. Save and Restore</h2>
          <span className="rounded bg-black/5 px-2 py-1 text-xs uppercase">
            Storage: {storageProvider === "justjson" ? "JustJSON Cloud" : "Local Browser"}
          </span>
        </div>
        <button
          className="btn-primary mt-3 w-full md:w-auto"
          disabled={!!loading}
          onClick={() => run("save snapshot", saveCurrentSnapshot)}
        >
          Save Current Workspace
        </button>
        <ul className="mt-4 grid gap-2">
          {snapshots.map((snapshot) => (
            <li key={snapshot.id} className="rounded border border-black/10 p-3 text-sm">
              <p className="font-medium">{snapshot.topIdeaTitle}</p>
              <p className="text-xs text-black/70">
                {snapshot.niche} | {new Date(snapshot.createdAt).toLocaleString()}
              </p>
              <button
                className="btn-secondary mt-2 text-xs"
                onClick={() => restoreSnapshot(snapshot)}
              >
                Restore
              </button>
            </li>
          ))}
          {snapshots.length === 0 ? <li className="text-sm text-black/60">No saved snapshots yet.</li> : null}
        </ul>
      </section>

      {loading ? <p className="text-sm text-black/70">Running: {loading}...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
