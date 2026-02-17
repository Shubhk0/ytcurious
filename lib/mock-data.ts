import type { CreativeBrief, EmptyViewsAssessment, IdeaCard, LearningInsight, ScoredPackage, ShotPlanStep } from "@/lib/types";

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

export function generateHookOptions(selectedIdeaTitle: string, audience = "creators who want faster growth"): string[] {
  const title = selectedIdeaTitle.trim() || "this video";
  return [
    `I used to waste weeks on ${title} until this one change fixed it.`,
    `If you are ${audience}, this ${title} framework can save your next upload.`,
    `I tested ${title} in real conditions and one result surprised me.`,
    `Most people try ${title} the wrong way. Here is what actually worked.`,
    `Before you publish your next video, steal this ${title} checklist first.`
  ];
}

export function generateShotPlan(scriptDraft: string, targetDurationMin: number): ShotPlanStep[] {
  const clean = scriptDraft
    .replace(/\r/g, "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const lines = clean.length > 0
    ? clean
    : [
        "State the problem and stakes in one sentence.",
        "Show the common mistake.",
        "Reveal your tested method.",
        "Present results and what to copy."
      ];

  const maxSteps = Math.min(7, Math.max(4, Math.round(targetDurationMin / 2)));
  return lines.slice(0, maxSteps).map((line, index) => ({
    id: randomId(),
    beat: `Beat ${index + 1}`,
    objective: line,
    primaryShot: index === 0 ? "A-roll close framing with direct eye-line" : "A-roll medium framing with movement",
    bRoll: index % 2 === 0 ? "Screen capture with highlighted metric" : "Before/after visual cutaway",
    onScreenText: index === 0 ? "The problem in 7 words" : `Proof point ${index + 1}`,
    editNote: index === 0 ? "Open with jump-cut and no intro bumper" : "Trim pauses and add pattern interrupt at midpoint"
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

export function assessEmptyViewsRisk(
  scoredPackage: ScoredPackage | null,
  first15sHook: string,
  questionChain: string[]
): EmptyViewsAssessment {
  if (!scoredPackage) {
    return {
      riskScore: 8.2,
      riskLabel: "High",
      reasons: ["No validated package selected yet."],
      fixes: ["Score packaging first before production."]
    };
  }

  const reasons: string[] = [];
  const fixes: string[] = [];
  let risk = 5;

  if (scoredPackage.score.clickPotential >= 8 && scoredPackage.score.giveMore <= 6) {
    risk += 2.2;
    reasons.push("High click potential but weaker value payoff can attract low-quality clicks.");
    fixes.push("Add concrete payoff language: numbers, proof, or before/after outcome.");
  }

  if (scoredPackage.score.respectTime <= 6) {
    risk += 1.4;
    reasons.push("Packaging suggests slower value delivery.");
    fixes.push("Shorten and sharpen title angle to communicate immediate value.");
  }

  if (first15sHook.trim().length < 25) {
    risk += 1.2;
    reasons.push("First 15-second hook is too vague/short.");
    fixes.push("Write a specific downside + promised result in first 15 seconds.");
  }

  if (questionChain.length < 4) {
    risk += 1.1;
    reasons.push("Question chain is underdeveloped, risking early story drop-off.");
    fixes.push("Use at least 4-5 question steps with delayed answers.");
  }

  const hasProofQuestion = questionChain.some((q) => /proof|result|measure|data/i.test(q));
  if (!hasProofQuestion) {
    risk += 0.9;
    reasons.push("Question chain lacks explicit proof checkpoint.");
    fixes.push("Add a proof-focused question (e.g., what measurable result proves this works?).");
  }

  const riskScore = Number(Math.max(0, Math.min(10, risk)).toFixed(1));
  const riskLabel: "Low" | "Medium" | "High" = riskScore >= 7.5 ? "High" : riskScore >= 5 ? "Medium" : "Low";

  if (reasons.length === 0) {
    reasons.push("Packaging and structure are balanced for durable audience quality.");
    fixes.push("Keep question chain and first-15s hook aligned with final payoff.");
  }

  return { riskScore, riskLabel, reasons, fixes };
}

export function applyEmptyViewsFixes(
  selectedIdeaTitle: string,
  titleAngle: string,
  first15sHook: string,
  questionChain: string[],
  assessment: EmptyViewsAssessment
): { nextTitleAngle: string; nextHook: string; nextQuestionChain: string[] } {
  let nextTitleAngle = titleAngle.trim() || selectedIdeaTitle;
  let nextHook = first15sHook.trim();
  let nextQuestionChain = questionChain.length > 0 ? [...questionChain] : [];

  const hasWeakPayoff = assessment.reasons.some((r) => /weaker value payoff|value proof/i.test(r));
  if (hasWeakPayoff && !/result|prove|measured|before|after|tracked/i.test(nextTitleAngle)) {
    nextTitleAngle = `${nextTitleAngle} (measured before/after results)`;
  }

  if (nextTitleAngle.length > 62) {
    nextTitleAngle = nextTitleAngle.slice(0, 59).trimEnd() + "...";
  }

  const needsHookFix = assessment.reasons.some((r) => /hook is too vague|slower value delivery/i.test(r));
  if (needsHookFix || nextHook.length < 25) {
    nextHook = `In 15 seconds: the exact problem, why most fail, and the measurable result we hit in "${selectedIdeaTitle}".`;
  }

  if (nextQuestionChain.length < 4) {
    nextQuestionChain = buildQuestionChain(selectedIdeaTitle);
  }
  const hasProofQuestion = nextQuestionChain.some((q) => /proof|result|measure|data/i.test(q));
  if (!hasProofQuestion) {
    nextQuestionChain.push("Q: What measurable proof confirms this worked?");
  }

  return { nextTitleAngle, nextHook, nextQuestionChain };
}
