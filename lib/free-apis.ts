export type TopicIntel = {
  topicTitle: string;
  summary: string;
  relatedTerms: string[];
};

export type YoutubeVideoMeta = {
  title: string;
  authorName: string;
  thumbnailUrl: string;
};

type WikiOpenSearchResponse = [string, string[], string[], string[]];

type DatamuseWord = {
  word: string;
  score?: number;
};

type YoutubeOEmbedResponse = {
  title: string;
  author_name: string;
  thumbnail_url: string;
};

export async function fetchTopicIntel(topic: string): Promise<TopicIntel> {
  const cleanTopic = topic.trim();
  if (!cleanTopic) {
    return { topicTitle: "", summary: "", relatedTerms: [] };
  }

  const [wikiResult, relatedTerms] = await Promise.all([
    fetchWikipediaSummary(cleanTopic),
    fetchRelatedWords(cleanTopic)
  ]);

  return {
    topicTitle: wikiResult.topicTitle || cleanTopic,
    summary: wikiResult.summary,
    relatedTerms
  };
}

async function fetchWikipediaSummary(topic: string): Promise<{ topicTitle: string; summary: string }> {
  try {
    const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
    searchUrl.searchParams.set("action", "opensearch");
    searchUrl.searchParams.set("search", topic);
    searchUrl.searchParams.set("limit", "1");
    searchUrl.searchParams.set("namespace", "0");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("origin", "*");

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) {
      return { topicTitle: topic, summary: "" };
    }

    const searchJson = (await searchRes.json()) as WikiOpenSearchResponse;
    const topicTitle = searchJson?.[1]?.[0] ?? topic;
    const fallbackSummary = searchJson?.[2]?.[0] ?? "";

    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topicTitle)}`
    );

    if (!summaryRes.ok) {
      return { topicTitle, summary: fallbackSummary };
    }

    const summaryJson = (await summaryRes.json()) as { extract?: string };
    return { topicTitle, summary: summaryJson.extract ?? fallbackSummary };
  } catch {
    return { topicTitle: topic, summary: "" };
  }
}

async function fetchRelatedWords(topic: string): Promise<string[]> {
  try {
    const url = `https://api.datamuse.com/words?ml=${encodeURIComponent(topic)}&max=8`;
    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }
    const json = (await res.json()) as DatamuseWord[];
    return json.map((x) => x.word).filter(Boolean).slice(0, 8);
  } catch {
    return [];
  }
}

export async function fetchYoutubeVideoMeta(videoUrl: string): Promise<YoutubeVideoMeta | null> {
  try {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    const res = await fetch(endpoint);
    if (!res.ok) {
      return null;
    }
    const json = (await res.json()) as YoutubeOEmbedResponse;
    return {
      title: json.title,
      authorName: json.author_name,
      thumbnailUrl: json.thumbnail_url
    };
  } catch {
    return null;
  }
}
