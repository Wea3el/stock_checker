import { useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import RecommendationCard from "./RecommendationCard";
import { useHoldings } from "../../hooks/usePortfolio";
import { useBatchAnalyze } from "../../hooks/useRecommendations";
import type { Recommendation } from "../../types";

export default function Dashboard() {
  const { data: holdings } = useHoldings();
  const batchAnalyze = useBatchAnalyze();
  const [results, setResults] = useState<Recommendation[]>([]);
  const [singleTicker, setSingleTicker] = useState("");
  const [singleLoading, setSingleLoading] = useState(false);

  const portfolioTickers = [
    ...new Set((holdings ?? []).map((h) => h.symbol)),
  ];

  const handleAnalyzePortfolio = () => {
    if (portfolioTickers.length === 0) return;
    batchAnalyze.mutate(portfolioTickers, {
      onSuccess: (data) => setResults(data),
    });
  };

  const handleSingleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleTicker.trim()) return;
    setSingleLoading(true);
    try {
      const res = await fetch(
        `/api/recommendations/${singleTicker.trim().toUpperCase()}`
      );
      if (!res.ok) throw new Error("Analysis failed");
      const rec: Recommendation = await res.json();
      setResults((prev) => {
        const filtered = prev.filter((r) => r.ticker !== rec.ticker);
        return [rec, ...filtered];
      });
    } catch {
      // error handled silently
    } finally {
      setSingleLoading(false);
      setSingleTicker("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {portfolioTickers.length > 0 && (
          <button
            onClick={handleAnalyzePortfolio}
            disabled={batchAnalyze.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {batchAnalyze.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Analyze Portfolio ({portfolioTickers.length})
          </button>
        )}
      </div>

      <form onSubmit={handleSingleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Enter a ticker symbol (e.g. AAPL)"
            value={singleTicker}
            onChange={(e) => setSingleTicker(e.target.value.toUpperCase())}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={singleLoading || !singleTicker.trim()}
          className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {singleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Analyze"
          )}
        </button>
      </form>

      {batchAnalyze.isPending && (
        <div className="text-center py-12 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p>Analyzing {portfolioTickers.length} holdings... This may take a minute.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((rec) => (
            <RecommendationCard key={rec.ticker} rec={rec} />
          ))}
        </div>
      )}

      {results.length === 0 && !batchAnalyze.isPending && (
        <div className="text-center py-16 text-gray-400">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium text-gray-500">
            No recommendations yet
          </p>
          <p className="text-sm mt-1">
            Search for a ticker above or upload your portfolio and click "Analyze Portfolio"
          </p>
        </div>
      )}
    </div>
  );
}
