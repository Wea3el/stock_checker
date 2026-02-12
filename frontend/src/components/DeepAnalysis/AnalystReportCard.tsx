import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BarChart3,
  MessageCircle,
  Newspaper,
  PieChart,
} from "lucide-react";
import type { AnalystReport } from "../../types";

const ANALYST_ICONS: Record<string, typeof BarChart3> = {
  "Technical/Market Analyst": BarChart3,
  "Sentiment Analyst": MessageCircle,
  "News Analyst": Newspaper,
  "Fundamentals Analyst": PieChart,
};

const ANALYST_COLORS: Record<string, string> = {
  "Technical/Market Analyst": "bg-blue-100 text-blue-700",
  "Sentiment Analyst": "bg-purple-100 text-purple-700",
  "News Analyst": "bg-orange-100 text-orange-700",
  "Fundamentals Analyst": "bg-emerald-100 text-emerald-700",
};

interface Props {
  report: AnalystReport;
}

export default function AnalystReportCard({ report }: Props) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ANALYST_ICONS[report.analyst_name] ?? BarChart3;
  const colorClass =
    ANALYST_COLORS[report.analyst_name] ?? "bg-gray-100 text-gray-700";

  const preview = report.content.slice(0, 200);
  const hasMore = report.content.length > 200;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-semibold text-gray-900">
            {report.analyst_name}
          </span>
        </div>
        {hasMore &&
          (expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ))}
      </button>
      <div className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {expanded || !hasMore ? report.content : `${preview}...`}
      </div>
    </div>
  );
}
