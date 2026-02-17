type Generator = (prompt: string, options?: Record<string, unknown>) => Promise<Array<{ generated_text: string }>>;

let generatorPromise: Promise<Generator> | null = null;

async function getGenerator(): Promise<Generator> {
  if (!generatorPromise) {
    generatorPromise = (async () => {
      const { env, pipeline } = await import("@xenova/transformers");
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      return (await pipeline("text-generation", "Xenova/distilgpt2")) as Generator;
    })();
  }
  return generatorPromise;
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
  const generator = await getGenerator();
  const prompt = `YouTube video title ideas about ${niche}:\n1.`;
  const output = await generator(prompt, {
    max_new_tokens: 90,
    do_sample: true,
    temperature: 0.9,
    top_k: 60
  });

  const raw = output?.[0]?.generated_text ?? "";
  const text = raw.replace(prompt, "");
  const candidates = text
    .split(/[\n\.;]/g)
    .map(cleanCandidate)
    .filter((line) => line.length >= 12);

  const seeded = [
    `I tested ${niche} strategies for 30 days`,
    `The biggest ${niche} mistake beginners keep making`,
    `Can you master ${niche} in one week?`,
    `I copied top creators in ${niche} and tracked results`,
    `What nobody tells you about ${niche} growth`
  ];

  return uniqueStrings([...candidates, ...seeded]).slice(0, 8);
}
