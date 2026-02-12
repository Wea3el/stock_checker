import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Loader2, Brain } from "lucide-react";
import type { Holding, Recommendation } from "../../types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const badgeColors: Record<string, string> = {
  BUY: "bg-green-100 text-green-800",
  SELL: "bg-red-100 text-red-800",
  HOLD: "bg-yellow-100 text-yellow-800",
};

function ActionBadge({ rec }: { rec?: Recommendation }) {
  if (!rec) return <Loader2 className="w-4 h-4 animate-spin text-gray-300" />;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${badgeColors[rec.action] ?? "bg-gray-100 text-gray-600"}`}
    >
      {rec.action}
    </span>
  );
}

function GainLoss({ value, percent }: { value: number; percent: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`flex items-center gap-1 ${positive ? "text-green-600" : "text-red-600"}`}
    >
      {positive ? (
        <TrendingUp className="w-3.5 h-3.5" />
      ) : (
        <TrendingDown className="w-3.5 h-3.5" />
      )}
      {formatCurrency(Math.abs(value))} ({percent.toFixed(2)}%)
    </span>
  );
}

interface Props {
  holdings: Holding[];
  recommendations: Record<string, Recommendation>;
  analyzing: boolean;
}

export default function PortfolioTable({ holdings, recommendations, analyzing }: Props) {
  if (holdings.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No holdings loaded. Upload a Fidelity CSV to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500 font-medium">
            <th className="py-3 px-4">Symbol</th>
            <th className="py-3 px-4">Signal</th>
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4 text-right">Qty</th>
            <th className="py-3 px-4 text-right">Price</th>
            <th className="py-3 px-4 text-right">Value</th>
            <th className="py-3 px-4 text-right">Gain/Loss</th>
            <th className="py-3 px-4 text-center">Deep</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h, i) => (
            <tr
              key={`${h.symbol}-${i}`}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4">
                <Link
                  to={`/stocks/${h.symbol}`}
                  className="font-semibold text-blue-600 hover:underline no-underline"
                >
                  {h.symbol}
                </Link>
              </td>
              <td className="py-3 px-4">
                {analyzing && !recommendations[h.symbol] ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                ) : (
                  <ActionBadge rec={recommendations[h.symbol]} />
                )}
              </td>
              <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">
                {h.description}
              </td>
              <td className="py-3 px-4 text-right">{h.quantity}</td>
              <td className="py-3 px-4 text-right">
                {formatCurrency(h.last_price)}
              </td>
              <td className="py-3 px-4 text-right font-medium">
                {formatCurrency(h.current_value)}
              </td>
              <td className="py-3 px-4 text-right">
                <GainLoss
                  value={h.gain_loss_dollar}
                  percent={h.gain_loss_percent}
                />
              </td>
              <td className="py-3 px-4 text-center">
                <Link
                  to={`/deep-analysis/${h.symbol}`}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium hover:bg-purple-100 transition-colors no-underline"
                  title="Run multi-agent deep analysis"
                >
                  <Brain className="w-3 h-3" />
                  Analyze
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
