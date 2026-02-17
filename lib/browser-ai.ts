import type { CreativeBrief } from "@/lib/types";

type Text2TextGenerator = (
  prompt: string,
  options?: Record<string, unknown>
) => Promise<Array<{ generated_text: string }>>;

let generatorPromise: Promise<Text2TextGenerator> | null = null;

function makeDefaultTitles(niche: string): string[] {
  return [
    `I tested ${niche} strategies for 30 days`,
    `The biggest ${niche} mistake beginners keep making`,
    `Can you master ${niche} in one week?`,
    `I copied top creators in ${niche} and tracked results`,
    `What nobody tells you about ${niche} growth`
  ];
}

export function isBrowserAISupported(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return typeof window.WebAssembly !== "undefined";
}

async function getGenerator(): Promise<Text2TextGenerator> {
  if (!generatorPromise) {
    generatorPromise = (async () => {
      const { env, pipeline } = await import("@xenova/transformers");
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      return (await pipeline("text2text-generation", "Xenova/flan-t5-small")) as Text2TextGenerator;
    })();
  }
  return generatorPromise;
}

export async function warmupBrowserAI(): Promise<void> {
  await getGenerator();
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const cleaned = value.trim();
    if (!cleaned || seen.has(cleaned.toLowerCase())) {
      continue;
    }
    seen.add(cleaned.toLowerCase());
    result.push(cleaned);
  }
  return result;
}

function cleanCandidate(text: string): string {
  return text
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\d\-\.\)\s]+/, "")
    .trim()
    .slice(0, 90);
}

export async function generateIdeaTitlesInBrowser(niche: string): Promise<string[]> {
  if (!isBrowserAISupported()) {
    return makeDefaultTitles(niche);
  }
  const generator = await getGenerator();
  const prompt = [
    "Generate 8 short YouTube title ideas.",
    `Topic: ${niche}`,
    "Return one title per line.",
    "No numbering."
  ].join("\n");
  const output = await generator(prompt, {
    max_new_tokens: 140,
    do_sample: true,
    temperature: 0.85,
    top_k: 50
  });

  const text = output?.[0]?.generated_text ?? "";
  const candidates = text
    .split(/[\n;]/g)
    .map(cleanCandidate)
    .filter((line) => line.length >= 10 && line.length <= 90);

  return uniqueStrings([...candidates, ...makeDefaultTitles(niche)]).slice(0, 8);
}

function parseLines(raw: string, fallback: string[]): string[] {
  const lines = raw
    .split(/\n+/g)
    .map((line) => cleanCandidate(line))
    .filter((line) => line.length >= 8);
  const deduped = uniqueStrings(lines);
  return deduped.length > 0 ? deduped : fallback;
}

export async function generateBriefInBrowser(selectedIdeaTitle: string, selectedPackaging: string): Promise<CreativeBrief> {
  if (!isBrowserAISupported()) {
    return {
      selectedIdeaTitle,
      selectedPackaging,
      hooks: [
        "Open with end result first.",
        "State viewer pain and stakes.",
        "Preview one surprising result."
      ],
      beatOutline: [
        "Set challenge and success metric",
        "Run first attempt",
        "Show failure and fix",
        "Run improved attempt",
        "Reveal final lesson"
      ],
      retentionCheckpoints: [
        "0:20 stakes",
        "1:30 twist",
        "3:00 reveal"
      ],
      visualProofPrompts: [
        "Show before/after side by side",
        "Overlay measurable metric",
        "Use timeline progress graphic"
      ],
      ctaPlacement: "Primary CTA after final reveal."
    };
  }

  const generator = await getGenerator();
  const prompt = [
    "Create a concise YouTube creative brief.",
    `Idea: ${selectedIdeaTitle}`,
    `Packaging: ${selectedPackaging}`,
    "Output sections with new lines:",
    "HOOKS:",
    "BEATS:",
    "RETENTION:",
    "VISUALS:",
    "CTA:"
  ].join("\n");

  const output = await generator(prompt, {
    max_new_tokens: 220,
    do_sample: true,
    temperature: 0.8,
    top_k: 40
  });
  const raw = output?.[0]?.generated_text ?? "";

  const hooks = parseLines(raw.match(/HOOKS:([\s\S]*?)(BEATS:|RETENTION:|VISUALS:|CTA:|$)/i)?.[1] ?? "", [
    "Open with end result first.",
    "State stakes in one line.",
    "Promise one specific payoff."
  ]).slice(0, 4);

  const beats = parseLines(raw.match(/BEATS:([\s\S]*?)(RETENTION:|VISUALS:|CTA:|$)/i)?.[1] ?? "", [
    "Set challenge and constraints",
    "Attempt one and friction",
    "Adjustment and retry",
    "Final result and takeaway"
  ]).slice(0, 6);

  const retention = parseLines(raw.match(/RETENTION:([\s\S]*?)(VISUALS:|CTA:|$)/i)?.[1] ?? "", [
    "0:20 show downside risk",
    "1:30 introduce a twist",
    "3:00 reveal key metric"
  ]).slice(0, 4);

  const visuals = parseLines(raw.match(/VISUALS:([\s\S]*?)(CTA:|$)/i)?.[1] ?? "", [
    "Before/after visual",
    "Metric overlays",
    "Timeline progression graphics"
  ]).slice(0, 4);

  const cta = cleanCandidate(raw.match(/CTA:([\s\S]*)$/i)?.[1] ?? "") || "Primary CTA after final reveal.";

  return {
    selectedIdeaTitle,
    selectedPackaging,
    hooks,
    beatOutline: beats,
    retentionCheckpoints: retention,
    visualProofPrompts: visuals,
    ctaPlacement: cta
  };
}
