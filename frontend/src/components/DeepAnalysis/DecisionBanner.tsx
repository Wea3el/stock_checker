import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  action: "BUY" | "SELL" | "HOLD";
  ticker: string;
  finalDecision: string;
}

const ACTION_STYLES = {
  BUY: {
    bg: "bg-green-50",
    border: "border-green-300",
    text: "text-green-800",
    badge: "bg-green-600",
    icon: TrendingUp,
  },
  SELL: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-800",
    badge: "bg-red-600",
    icon: TrendingDown,
  },
  HOLD: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    text: "text-yellow-800",
    badge: "bg-yellow-600",
    icon: Minus,
  },
};

export default function DecisionBanner({ action, ticker, finalDecision }: Props) {
  const style = ACTION_STYLES[action] || ACTION_STYLES.HOLD;
  const Icon = style.icon;

  return (
    <div
      className={`${style.bg} ${style.border} border-2 rounded-xl p-6`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`${style.badge} text-white rounded-lg p-3 flex items-center justify-center`}
        >
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">
            Final Decision for {ticker}
          </div>
          <div className={`text-3xl font-bold ${style.text}`}>{action}</div>
        </div>
      </div>
      {finalDecision && (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {finalDecision}
        </p>
      )}
    </div>
  );
}
