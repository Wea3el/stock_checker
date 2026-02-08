import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  Hand,
  TrendingDown,
  ExternalLink,
  Newspaper,
} from "lucide-react";
import RecommendationCard from "./RecommendationCard";
import { useHoldings } from "../../hooks/usePortfolio";
import { useMarketNews } from "../../hooks/useNews";
import { batchAnalyze, getRecommendation } from "../../api/client";
import type { Recommendation, NewsArticle } from "../../types";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const { data: holdings } = useHoldings();
  const { data: marketNews, isLoading: newsLoading } = useMarketNews();
  const [results, setResults] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRan, setAutoRan] = useState(false);
  const [singleTicker, setSingleTicker] = useState("");
  const [singleLoading, setSingleLoading] = useState(false);

  const portfolioTickers = [...new Set((holdings ?? []).map((h) => h.symbol))];

  // Auto-analyze portfolio on load
  useEffect(() => {
    if (portfolioTickers.length === 0 || autoRan) return;
    setAutoRan(true);
    setLoading(true);
    batchAnalyze(portfolioTickers)
      .then((data) => setResults(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [portfolioTickers.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSingleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleTicker.trim()) return;
    setSingleLoading(true);
    try {
      const rec = await getRecommendation(singleTicker.trim().toUpperCase());
      setResults((prev) => {
        const filtered = prev.filter((r) => r.ticker !== rec.ticker);
        return [rec, ...filtered];
      });
    } catch {
      // silently handled
    } finally {
      setSingleLoading(false);
      setSingleTicker("");
    }
  };

  const buyList = results.filter((r) => r.action === "BUY");
  const holdList = results.filter((r) => r.action === "HOLD");
  const sellList = results.filter((r) => r.action === "SELL");

  return (
    <div className="space-y-8">
      {/* Search bar */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <form onSubmit={handleSingleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter a ticker symbol (e.g. AAPL) for AI analysis"
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
            {singleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p>Analyzing {portfolioTickers.length} holdings...</p>
        </div>
      )}

      {/* Action lists */}
      {results.length > 0 && !loading && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* BUY column */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="flex items-center gap-2 font-bold text-green-800 mb-4">
              <ShoppingCart className="w-5 h-5" />
              Buy / Add More ({buyList.length})
            </h2>
            {buyList.length === 0 ? (
              <p className="text-sm text-green-600 opacity-70">No buy signals right now</p>
            ) : (
              <div className="space-y-3">
                {buyList.map((rec) => (
                  <div key={rec.ticker} className="bg-white rounded-lg p-3 border border-green-100">
                    <div className="flex items-center justify-between mb-1">
                      <Link
                        to={`/stocks/${rec.ticker}`}
                        className="font-bold text-gray-900 hover:text-green-700 no-underline"
                      >
                        {rec.ticker}
                      </Link>
                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        {(rec.confidence * 100).toFixed(0)}% confident
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{rec.reasoning}</p>
                    <Link
                      to={`/stocks/${rec.ticker}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline no-underline"
                    >
                      <Newspaper className="w-3 h-3" />
                      View news & details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HOLD column */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <h2 className="flex items-center gap-2 font-bold text-yellow-800 mb-4">
              <Hand className="w-5 h-5" />
              Hold ({holdList.length})
            </h2>
            {holdList.length === 0 ? (
              <p className="text-sm text-yellow-600 opacity-70">No hold signals</p>
            ) : (
              <div className="space-y-3">
                {holdList.map((rec) => (
                  <div key={rec.ticker} className="bg-white rounded-lg p-3 border border-yellow-100">
                    <div className="flex items-center justify-between mb-1">
                      <Link
                        to={`/stocks/${rec.ticker}`}
                        className="font-bold text-gray-900 hover:text-yellow-700 no-underline"
                      >
                        {rec.ticker}
                      </Link>
                      <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                        {(rec.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{rec.reasoning}</p>
                    <Link
                      to={`/stocks/${rec.ticker}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline no-underline"
                    >
                      <Newspaper className="w-3 h-3" />
                      View news & details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SELL column */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h2 className="flex items-center gap-2 font-bold text-red-800 mb-4">
              <TrendingDown className="w-5 h-5" />
              Consider Selling ({sellList.length})
            </h2>
            {sellList.length === 0 ? (
              <p className="text-sm text-red-600 opacity-70">No sell signals right now</p>
            ) : (
              <div className="space-y-3">
                {sellList.map((rec) => (
                  <div key={rec.ticker} className="bg-white rounded-lg p-3 border border-red-100">
                    <div className="flex items-center justify-between mb-1">
                      <Link
                        to={`/stocks/${rec.ticker}`}
                        className="font-bold text-gray-900 hover:text-red-700 no-underline"
                      >
                        {rec.ticker}
                      </Link>
                      <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        {(rec.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{rec.reasoning}</p>
                    <Link
                      to={`/stocks/${rec.ticker}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline no-underline"
                    >
                      <Newspaper className="w-3 h-3" />
                      View news & details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* All recommendation cards */}
      {results.length > 0 && !loading && (
        <div>
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Full Analysis
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((rec) => (
              <RecommendationCard key={rec.ticker} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Market news */}
      <div>
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Market-Moving News
        </h2>
        {newsLoading ? (
          <div className="text-center py-8 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading market news...
          </div>
        ) : marketNews && marketNews.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {marketNews.map((article: NewsArticle, i: number) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow no-underline block"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                </div>
                {article.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="font-medium">{article.source}</span>
                  <span>&middot;</span>
                  <span>{timeAgo(article.published_at)}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-400">
            No market news available. Check your NewsAPI key.
          </p>
        )}
      </div>

      {results.length === 0 && !loading && portfolioTickers.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium text-gray-500">No recommendations yet</p>
          <p className="text-sm mt-1">
            Search for a ticker above or{" "}
            <Link to="/portfolio" className="text-blue-600 hover:underline">
              upload your portfolio
            </Link>{" "}
            for automatic analysis
          </p>
        </div>
      )}
    </div>
  );
}
