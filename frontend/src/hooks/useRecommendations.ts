import { useQuery, useMutation } from "@tanstack/react-query";
import { getRecommendation, batchAnalyze } from "../api/client";

export function useRecommendation(ticker: string) {
  return useQuery({
    queryKey: ["recommendation", ticker],
    queryFn: () => getRecommendation(ticker),
    enabled: !!ticker,
    staleTime: 15 * 60 * 1000,
  });
}

export function useBatchAnalyze() {
  return useMutation({
    mutationFn: batchAnalyze,
  });
}
