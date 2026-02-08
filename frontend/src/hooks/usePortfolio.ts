import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHoldings, getPortfolioSummary, uploadPortfolio } from "../api/client";

export function useHoldings() {
  return useQuery({
    queryKey: ["holdings"],
    queryFn: getHoldings,
  });
}

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ["portfolio-summary"],
    queryFn: getPortfolioSummary,
  });
}

export function useUploadPortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holdings"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-summary"] });
    },
  });
}
