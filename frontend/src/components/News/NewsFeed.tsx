import { Loader2, Newspaper } from "lucide-react";
import NewsArticleCard from "./NewsArticleCard";
import { useNews } from "../../hooks/useNews";

export default function NewsFeed({ ticker }: { ticker: string }) {
  const { data: articles, isLoading, isError } = useNews(ticker);

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        Loading news...
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center py-8 text-red-500">Failed to load news.</p>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No news found for {ticker}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article, i) => (
        <NewsArticleCard key={i} article={article} />
      ))}
    </div>
  );
}
