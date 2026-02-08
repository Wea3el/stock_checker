interface Props {
  action: string;
  confidence: number;
}

const colors: Record<string, string> = {
  BUY: "bg-green-100 text-green-800 border-green-200",
  SELL: "bg-red-100 text-red-800 border-red-200",
  HOLD: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export default function SentimentBadge({ action, confidence }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${
        colors[action] ?? "bg-gray-100 text-gray-800 border-gray-200"
      }`}
    >
      {action}
      <span className="text-xs font-normal opacity-70">
        {(confidence * 100).toFixed(0)}%
      </span>
    </span>
  );
}
