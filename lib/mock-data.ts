import type { CreativeBrief, IdeaCard, LearningInsight, ScoredPackage } from "@/lib/types";

const randomId = () => Math.random().toString(36).slice(2, 10);

export function generateIdeaCards(niche: string, relatedTerms: string[] = []): IdeaCard[] {
  const templates = [
    "I Tried {niche} for 30 Days",
    "The Biggest Mistake in {niche} Nobody Talks About",
    "I Spent $500 Testing Viral {niche} Hacks",
    "Can You Master {niche} in 7 Days?",
    "I Copied the Top 1% in {niche} and Measured Results"
  ];

  return templates.map((t, index) => ({
    id: randomId(),
    title: t.replace("{niche}", pickNicheVariant(niche, relatedTerms, index)),
    coreAudience: `${niche} beginners who want faster results with ${pickRelatedTerm(relatedTerms, index)}`,
    promise: "Get practical shortcuts and avoid common waste.",
    curiosityGap: "What happens when proven advice meets real constraints?",
    noveltyType: (["format", "angle", "collab", "challenge"] as const)[index % 4],
    estimatedEffort: (["low", "medium", "high"] as const)[index % 3]
  }));
}

export function ideaCardsFromTitles(niche: string, titles: string[]): IdeaCard[] {
  return titles.map((title, index) => ({
    id: randomId(),
    title,
    coreAudience: `${niche} creators who want repeatable growth`,
    promise: "Practical, testable actions with measurable outcomes.",
    curiosityGap: "What changes if proven advice is applied with strict constraints?",
    noveltyType: (["format", "angle", "collab", "challenge"] as const)[index % 4],
    estimatedEffort: (["low", "medium", "high"] as const)[index % 3]
  }));
}

function pickNicheVariant(niche: string, relatedTerms: string[], index: number): string {
  const term = relatedTerms[index % relatedTerms.length];
  if (!term) {
    return niche;
  }
  return `${niche} (${term})`;
}

function pickRelatedTerm(relatedTerms: string[], index: number): string {
  const term = relatedTerms[index % relatedTerms.length];
  return term ?? "a practical system";
}

export function scorePackaging(titles: string[], thumbnailConcepts: string[]): ScoredPackage[] {
  return titles.slice(0, 5).map((title, idx) => {
    const lower = title.toLowerCase();
    const hasNumber = /\d/.test(title);
    const hasQuestion = title.includes("?");
    const hasOutcomeWord = /(results|tested|mistake|truth|secret|prove|challenge|failed|worked)/i.test(title);
    const shortEnough = title.length <= 62;

    const clarity = 6 + (idx % 4);
    const curiosity = 7 + ((idx + 1) % 3);
    const specificity = 5 + (idx % 5);
    const audienceFit = 6 + ((idx + 2) % 4);
    const novelty = 5 + ((idx + 1) % 5);
    const clickPotential = Math.min(10, 5 + (hasNumber ? 2 : 0) + (hasQuestion ? 1 : 0) + (hasOutcomeWord ? 2 : 0));
    const respectTime = Math.min(10, 5 + (shortEnough ? 3 : 0) + (/30 days|7 days|in \d+/i.test(lower) ? 2 : 0));
    const giveMore = Math.min(10, 4 + (/tracked|measured|before|after|results/i.test(lower) ? 4 : 0) + (hasNumber ? 2 : 0));
    const curiosityGap = Math.min(10, 5 + (hasQuestion ? 3 : 0) + (/why|what|nobody|truth|secret/i.test(lower) ? 2 : 0));
    const total = Number(
      (
        (clarity +
          curiosity +
          specificity +
          audienceFit +
          novelty +
          clickPotential +
          respectTime +
          giveMore +
          curiosityGap) /
        9
      ).toFixed(1)
    );

    const riskFlags: string[] = [];
    if (!shortEnough) {
      riskFlags.push("Title may be too long for fast decision clicks");
    }
    if (!hasQuestion && !hasOutcomeWord) {
      riskFlags.push("Curiosity gap may be weak");
    }
    if (!/tested|results|measured|prove|challenge|before|after/i.test(lower)) {
      riskFlags.push("Value proof may be unclear");
    }
    if (riskFlags.length === 0) {
      riskFlags.push("Low obvious risk in packaging");
    }

    return {
      title,
      thumbnailConcept: thumbnailConcepts[idx % thumbnailConcepts.length] ?? "Face reaction + bold visual delta",
      score: {
        clarity,
        curiosity,
        specificity,
        audienceFit,
        novelty,
        clickPotential,
        respectTime,
        giveMore,
        curiosityGap,
        total
      },
      rationale: "Scored against click intent, time respect, and clear value payoff to reduce empty-view risk.",
      riskFlags
    };
  });
}

export function buildQuestionChain(selectedIdeaTitle: string): string[] {
  return [
    `Q1: What is the core challenge in "${selectedIdeaTitle}"?`,
    "Q2: Why does the common approach fail?",
    "Q3: What changed in our new approach?",
    "Q4: What measurable proof shows it works?",
    "Q5: How can viewers apply this immediately?"
  ];
}

export function buildRetentionCheckpoints(targetDurationMin: number): string[] {
  const durationSec = Math.max(120, Math.floor(targetDurationMin * 60));
  const checkpointsSec = [20, Math.floor(durationSec * 0.25), Math.floor(durationSec * 0.5), Math.floor(durationSec * 0.75)];
  return checkpointsSec.map((sec, idx) => {
    const mm = Math.floor(sec / 60);
    const ss = String(sec % 60).padStart(2, "0");
    const label = ["stakes reminder", "rehook twist", "proof reveal", "final escalation"][idx] ?? "attention reset";
    return `At ${mm}:${ss}: ${label}`;
  });
}

export function generateBrief(
  selectedIdeaTitle: string,
  selectedPackaging: string,
  targetDurationMin = 8,
  questionChain: string[] = buildQuestionChain(selectedIdeaTitle)
): CreativeBrief {
  return {
    selectedIdeaTitle,
    selectedPackaging,
    hooks: [
      "Open with the end result first, then jump to the challenge.",
      "State the viewer pain in one sentence and promise the experiment.",
      "Use a visual scoreboard that updates every segment."
    ],
    questionChain,
    beatOutline: [
      "Set stakes and rules",
      "Run first attempt with friction",
      "Reveal failure and adjustment",
      "Run improved method",
      "Compare before/after outcome",
      "Deliver takeaway and next challenge"
    ],
    retentionCheckpoints: buildRetentionCheckpoints(targetDurationMin),
    visualProofPrompts: [
      "Overlay side-by-side progress timeline",
      "Use receipts/screen captures as proof beats",
      "Include one real audience comment as narrative pivot"
    ],
    ctaPlacement: "Primary CTA at final payoff reveal; secondary CTA in pinned comment."
  };
}

export function ingestLearning(videoUrl: string, notes?: string): LearningInsight[] {
  return [
    {
      id: randomId(),
      lesson: `Early framing around stakes improved click intent for ${videoUrl}.`,
      confidence: 0.72,
      actionForNextVideo: "Lead with specific downside before introducing method."
    },
    {
      id: randomId(),
      lesson: notes?.trim() ? `Creator note captured: ${notes.trim()}` : "No creator note provided.",
      confidence: 0.55,
      actionForNextVideo: "Reuse best-performing language pattern from this upload."
    }
  ];
}
