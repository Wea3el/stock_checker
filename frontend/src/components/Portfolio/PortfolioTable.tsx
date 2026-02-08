import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Holding } from "../../types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function GainLoss({ value, percent }: { value: number; percent: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`flex items-center gap-1 ${
        positive ? "text-green-600" : "text-red-600"
      }`}
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

export default function PortfolioTable({
  holdings,
}: {
  holdings: Holding[];
}) {
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
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4 text-right">Qty</th>
            <th className="py-3 px-4 text-right">Price</th>
            <th className="py-3 px-4 text-right">Value</th>
            <th className="py-3 px-4 text-right">Gain/Loss</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
