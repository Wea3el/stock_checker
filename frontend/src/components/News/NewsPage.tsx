import { useState } from "react";
import { Search, Loader2, ExternalLink, Newspaper } from "lucide-react";
import NewsFeed from "./NewsFeed";
import { useMarketNews } from "../../hooks/useNews";
import type { NewsArticle } from "../../types";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NewsPage() {
  const [ticker, setTicker] = useState("");
  const [activeTicker, setActiveTicker] = useState("");
  const { data: marketNews, isLoading: marketLoading } = useMarketNews();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      setActiveTicker(ticker.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">News</h1>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter news by ticker (e.g. TSLA)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={!ticker.trim()}
          className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          Search
        </button>
        {activeTicker && (
          <button
            type="button"
            onClick={() => {
              setActiveTicker("");
              setTicker("");
            }}
            className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Ticker-specific news */}
      {activeTicker && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">
            News for {activeTicker}
          </h2>
          <NewsFeed ticker={activeTicker} />
        </div>
      )}

      {/* Market-wide news feed */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          Market News
        </h2>

        {marketLoading ? (
          <div className="text-center py-8 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading market news...
          </div>
        ) : marketNews && marketNews.length > 0 ? (
          <div className="space-y-3">
            {marketNews.map((article: NewsArticle, i: number) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow no-underline"
              >
                <div className="flex">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt=""
                      className="w-36 h-28 object-cover hidden sm:block"
                    />
                  )}
                  <div className="p-4 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {article.title}
                      </h3>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    </div>
                    {article.description && (
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span className="font-medium">{article.source}</span>
                      <span>&middot;</span>
                      <span>{timeAgo(article.published_at)}</span>
                    </div>
                  </div>
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
    </div>
  );
}
