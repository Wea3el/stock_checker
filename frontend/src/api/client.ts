import axios from "axios";
import type {
  Holding,
  PortfolioSummary,
  NewsArticle,
  Recommendation,
  StockInfo,
  PricePoint,
  SSEEvent,
  DeepAnalysis,
  DeepAnalysisJob,
  DeepAnalysisSSEEvent,
} from "../types";

const api = axios.create({ baseURL: "/api" });

// Portfolio
export async function uploadPortfolio(file: File): Promise<Holding[]> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<Holding[]>("/portfolio/upload", form);
  return data;
}

export async function getHoldings(): Promise<Holding[]> {
  const { data } = await api.get<Holding[]>("/portfolio/holdings");
  return data;
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const { data } = await api.get<PortfolioSummary>("/portfolio/summary");
  return data;
}

// News
export async function getNews(ticker: string): Promise<NewsArticle[]> {
  const { data } = await api.get<NewsArticle[]>(`/news/${ticker}`);
  return data;
}

export async function getMarketNews(): Promise<NewsArticle[]> {
  const { data } = await api.get<NewsArticle[]>("/news/market");
  return data;
}

// Recommendations
export async function getRecommendation(
  ticker: string
): Promise<Recommendation> {
  const { data } = await api.get<Recommendation>(`/recommendations/${ticker}`);
  return data;
}

export async function getTopPicks(): Promise<Recommendation[]> {
  const { data } = await api.get<Recommendation[]>("/recommendations/top-picks");
  return data;
}

export async function batchAnalyze(
  tickers: string[]
): Promise<Recommendation[]> {
  const { data } = await api.post<Recommendation[]>(
    "/recommendations/analyze",
    { tickers }
  );
  return data;
}

// Stocks
export async function getStockInfo(ticker: string): Promise<StockInfo> {
  const { data } = await api.get<StockInfo>(`/stocks/${ticker}`);
  return data;
}

export async function getPriceHistory(
  ticker: string,
  period = "1mo",
  interval = "1d"
): Promise<PricePoint[]> {
  const { data } = await api.get<PricePoint[]>(`/stocks/${ticker}/history`, {
    params: { period, interval },
  });
  return data;
}

// Deep Analysis (TradingAgents)
export async function startDeepAnalysis(
  ticker: string
): Promise<{ job_id: string; ticker: string }> {
  const { data } = await api.post<{ job_id: string; ticker: string }>(
    "/deep-analysis/start",
    { ticker }
  );
  return data;
}

export async function getDeepAnalysisJob(
  jobId: string
): Promise<DeepAnalysisJob> {
  const { data } = await api.get<DeepAnalysisJob>(
    `/deep-analysis/job/${jobId}`
  );
  return data;
}

export async function getCachedDeepAnalysis(
  ticker: string
): Promise<DeepAnalysis> {
  const { data } = await api.get<DeepAnalysis>(
    `/deep-analysis/result/${ticker}`
  );
  return data;
}

export async function streamDeepAnalysis(
  ticker: string,
  onEvent: (event: DeepAnalysisSSEEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch("/api/deep-analysis/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker }),
    signal,
  });

  if (!response.ok)
    throw new Error(`Deep analysis failed: ${response.status}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      try {
        const event: DeepAnalysisSSEEvent = JSON.parse(trimmed.slice(6));
        onEvent(event);
      } catch {
        // skip malformed events
      }
    }
  }
}

// Chat (SSE streaming)
export async function streamChat(
  message: string,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    signal,
  });

  if (!response.ok) throw new Error(`Chat failed: ${response.status}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      try {
        const event: SSEEvent = JSON.parse(trimmed.slice(6));
        onEvent(event);
      } catch {
        // skip malformed events
      }
    }
  }
}
