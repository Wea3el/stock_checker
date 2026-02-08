import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, BarChart3, Hash, Loader2 } from "lucide-react";
import PortfolioUpload from "./PortfolioUpload";
import PortfolioTable from "./PortfolioTable";
import { usePortfolioSummary } from "../../hooks/usePortfolio";
import { batchAnalyze } from "../../api/client";
import type { Recommendation } from "../../types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function PortfolioPage() {
  const { data: summary, isLoading } = usePortfolioSummary();
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  // Auto-analyze whenever holdings change
  const tickers = [...new Set((summary?.holdings ?? []).map((h) => h.symbol))];
  const tickerKey = tickers.sort().join(",");

  useEffect(() => {
    if (tickers.length === 0 || analyzed) return;
    setAnalyzing(true);
    batchAnalyze(tickers)
      .then((recs) => {
        const map: Record<string, Recommendation> = {};
        for (const r of recs) map[r.ticker] = r;
        setRecommendations(map);
        setAnalyzed(true);
      })
      .catch(() => {})
      .finally(() => setAnalyzing(false));
  }, [tickerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = [
    {
      label: "Total Value",
      value: formatCurrency(summary?.total_value ?? 0),
      icon: DollarSign,
    },
    {
      label: "Total Gain/Loss",
      value: formatCurrency(summary?.total_gain_loss ?? 0),
      icon: TrendingUp,
      color: (summary?.total_gain_loss ?? 0) >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Return",
      value: `${(summary?.total_gain_loss_percent ?? 0).toFixed(2)}%`,
      icon: BarChart3,
      color: (summary?.total_gain_loss_percent ?? 0) >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Holdings",
      value: summary?.num_holdings ?? 0,
      icon: Hash,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>

      <PortfolioUpload onUploadSuccess={() => setAnalyzed(false)} />

      {summary && summary.num_holdings > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </div>
                <div className={`text-xl font-bold ${s.color ?? "text-gray-900"}`}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {analyzing && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing your holdings with AI... this may take a moment
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <PortfolioTable
              holdings={summary.holdings}
              recommendations={recommendations}
              analyzing={analyzing}
            />
          </div>
        </>
      )}

      {isLoading && (
        <div className="text-center py-8 text-gray-500">Loading portfolio...</div>
      )}
    </div>
  );
}
