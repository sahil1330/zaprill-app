import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const SEARCH_MODEL = "gpt-5-mini";

export type WebSearchHit = {
  answer: string;
  sources: Array<{ url: string; title?: string }>;
  unavailable?: boolean;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
};

function sourceUrl(source: {
  sourceType: string;
  url?: string;
  title?: string;
}): { url: string; title?: string } | null {
  if (source.sourceType === "url" && source.url) {
    return { url: source.url, title: source.title };
  }
  return null;
}

/**
 * One grounded lookup. Token cost is logged by the caller with the existing
 * resume_chat action. OpenAI also bills a search-tool fee outside MODEL_RATES.
 */
export async function searchResumeWeb(query: string): Promise<WebSearchHit> {
  try {
    const result = await generateText({
      model: openai(SEARCH_MODEL),
      tools: {
        web_search: openai.tools.webSearch({ searchContextSize: "low" }),
      },
      prompt: `Look up current resume guidance for this question and answer in under 120 words. Include the source URLs you actually opened. Do not invent URLs or statistics.\n\nQuestion: ${query}`,
    });
    const sources = result.sources
      .map(sourceUrl)
      .filter((item): item is { url: string; title?: string } => item != null);
    return {
      answer: result.text.trim() || "No answer text came back.",
      sources,
      usage: {
        inputTokens: result.usage.inputTokens ?? 0,
        outputTokens: result.usage.outputTokens ?? 0,
        totalTokens: result.usage.totalTokens ?? 0,
      },
    };
  } catch {
    return {
      answer:
        "Web search is unavailable. Answer from the knowledge slice already in the prompt and say the live lookup failed.",
      sources: [],
      unavailable: true,
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    };
  }
}
