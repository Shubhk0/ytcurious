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
    const clarity = 6 + (idx % 4);
    const curiosity = 7 + ((idx + 1) % 3);
    const specificity = 5 + (idx % 5);
    const audienceFit = 6 + ((idx + 2) % 4);
    const novelty = 5 + ((idx + 1) % 5);
    const total = Number(((clarity + curiosity + specificity + audienceFit + novelty) / 5).toFixed(1));

    return {
      title,
      thumbnailConcept: thumbnailConcepts[idx % thumbnailConcepts.length] ?? "Face reaction + bold visual delta",
      score: { clarity, curiosity, specificity, audienceFit, novelty, total },
      rationale: "Strong promise with a measurable transformation and visible stakes.",
      riskFlags: idx % 2 === 0 ? ["Could be too broad for return viewers"] : ["Title may overpromise outcome"]
    };
  });
}

export function generateBrief(selectedIdeaTitle: string, selectedPackaging: string): CreativeBrief {
  return {
    selectedIdeaTitle,
    selectedPackaging,
    hooks: [
      "Open with the end result first, then jump to the challenge.",
      "State the viewer pain in one sentence and promise the experiment.",
      "Use a visual scoreboard that updates every segment."
    ],
    beatOutline: [
      "Set stakes and rules",
      "Run first attempt with friction",
      "Reveal failure and adjustment",
      "Run improved method",
      "Compare before/after outcome",
      "Deliver takeaway and next challenge"
    ],
    retentionCheckpoints: [
      "At 0:20: show what could be lost if strategy fails",
      "At 1:45: add a mini-twist to reset attention",
      "At 3:30: reveal surprising metric gap",
      "At 5:00: commit to final high-risk attempt"
    ],
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
