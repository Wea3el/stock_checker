import { useQuery } from "@tanstack/react-query";
import { getNews } from "../api/client";

export function useNews(ticker: string) {
  return useQuery({
    queryKey: ["news", ticker],
    queryFn: () => getNews(ticker),
    enabled: !!ticker,
    staleTime: 15 * 60 * 1000,
  });
}
