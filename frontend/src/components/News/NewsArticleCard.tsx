import { ExternalLink } from "lucide-react";
import type { NewsArticle } from "../../types";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NewsArticleCard({
  article,
}: {
  article: NewsArticle;
}) {
  return (
    <a
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
            className="w-32 h-full object-cover hidden sm:block"
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
            <span>{article.source}</span>
            <span>&middot;</span>
            <span>{timeAgo(article.published_at)}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
