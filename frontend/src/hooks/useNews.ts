import { useQuery } from "@tanstack/react-query";
import { getNews, getMarketNews } from "../api/client";

export function useNews(ticker: string) {
  return useQuery({
    queryKey: ["news", ticker],
    queryFn: () => getNews(ticker),
    enabled: !!ticker,
    staleTime: 15 * 60 * 1000,
  });
}

export function useMarketNews() {
  return useQuery({
    queryKey: ["market-news"],
    queryFn: getMarketNews,
    staleTime: 15 * 60 * 1000,
  });
}
