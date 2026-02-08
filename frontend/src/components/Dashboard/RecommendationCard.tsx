import { Link } from "react-router-dom";
import SentimentBadge from "./SentimentBadge";
import type { Recommendation } from "../../types";

export default function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <Link
          to={`/stocks/${rec.ticker}`}
          className="text-lg font-bold text-gray-900 hover:text-blue-600 no-underline"
        >
          {rec.ticker}
        </Link>
        <SentimentBadge action={rec.action} confidence={rec.confidence} />
      </div>

      <p className="text-sm text-gray-600 mb-3">{rec.reasoning}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {rec.key_factors.map((factor, i) => (
          <span
            key={i}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md"
          >
            {factor}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Sentiment</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              rec.sentiment_score >= 0 ? "bg-green-500" : "bg-red-500"
            }`}
            style={{
              width: `${Math.abs(rec.sentiment_score) * 50 + 50}%`,
              marginLeft:
                rec.sentiment_score < 0
                  ? `${50 + rec.sentiment_score * 50}%`
                  : "50%",
            }}
          />
        </div>
        <span className="text-xs font-mono text-gray-500">
          {rec.sentiment_score > 0 ? "+" : ""}
          {rec.sentiment_score.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
