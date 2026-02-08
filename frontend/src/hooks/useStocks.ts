import { useQuery } from "@tanstack/react-query";
import { getStockInfo, getPriceHistory } from "../api/client";

export function useStockInfo(ticker: string) {
  return useQuery({
    queryKey: ["stock", ticker],
    queryFn: () => getStockInfo(ticker),
    enabled: !!ticker,
    staleTime: 15 * 60 * 1000,
  });
}

export function usePriceHistory(
  ticker: string,
  period = "1mo",
  interval = "1d"
) {
  return useQuery({
    queryKey: ["price-history", ticker, period, interval],
    queryFn: () => getPriceHistory(ticker, period, interval),
    enabled: !!ticker,
    staleTime: 15 * 60 * 1000,
  });
}
