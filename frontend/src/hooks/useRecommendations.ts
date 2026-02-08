import { useQuery, useMutation } from "@tanstack/react-query";
import { getRecommendation, batchAnalyze, getTopPicks } from "../api/client";

export function useRecommendation(ticker: string) {
  return useQuery({
    queryKey: ["recommendation", ticker],
    queryFn: () => getRecommendation(ticker),
    enabled: !!ticker,
    staleTime: 15 * 60 * 1000,
  });
}

export function useTopPicks() {
  return useQuery({
    queryKey: ["top-picks"],
    queryFn: getTopPicks,
    staleTime: 15 * 60 * 1000,
  });
}

export function useBatchAnalyze() {
  return useMutation({
    mutationFn: batchAnalyze,
  });
}
