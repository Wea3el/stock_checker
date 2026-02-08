import axios from "axios";
import type {
  Holding,
  PortfolioSummary,
  NewsArticle,
  Recommendation,
  StockInfo,
  PricePoint,
  SSEEvent,
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
