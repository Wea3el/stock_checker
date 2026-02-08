import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Loader2,
  DollarSign,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useStockInfo, usePriceHistory } from "../../hooks/useStocks";
import { useRecommendation } from "../../hooks/useRecommendations";
import SentimentBadge from "../Dashboard/SentimentBadge";
import NewsFeed from "../News/NewsFeed";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatLargeNumber(value: number | null) {
  if (value == null) return "N/A";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return formatCurrency(value);
}

const periods = [
  { label: "1W", value: "5d", interval: "1d" },
  { label: "1M", value: "1mo", interval: "1d" },
  { label: "3M", value: "3mo", interval: "1d" },
  { label: "6M", value: "6mo", interval: "1wk" },
  { label: "1Y", value: "1y", interval: "1wk" },
];

export default function StockDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const symbol = ticker?.toUpperCase() ?? "";
  const [period, setPeriod] = useState(periods[1]);

  const { data: stock, isLoading: stockLoading } = useStockInfo(symbol);
  const { data: history, isLoading: histLoading } = usePriceHistory(
    symbol,
    period.value,
    period.interval
  );
  const {
    data: rec,
    isLoading: recLoading,
    refetch: fetchRec,
    isFetched,
  } = useRecommendation(symbol);

  const positive = (stock?.change ?? 0) >= 0;

  return (
    <div className="space-y-6">
      <Link
        to="/stocks"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 no-underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to search
      </Link>

      {stockLoading ? (
        <div className="text-center py-12 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      ) : stock ? (
        <>
          {/* Price header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {stock.ticker}
                </h1>
                <p className="text-gray-500">{stock.name}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stock.price)}
                </div>
                <div
                  className={`flex items-center justify-end gap-1 text-sm font-medium ${
                    positive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {positive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {positive ? "+" : ""}
                  {stock.change.toFixed(2)} ({positive ? "+" : ""}
                  {stock.change_percent.toFixed(2)}%)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div>
                <span className="text-xs text-gray-500">Market Cap</span>
                <p className="font-semibold">
                  {formatLargeNumber(stock.market_cap)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">P/E Ratio</span>
                <p className="font-semibold">
                  {stock.pe_ratio?.toFixed(2) ?? "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">52W High</span>
                <p className="font-semibold">
                  {stock.fifty_two_week_high
                    ? formatCurrency(stock.fifty_two_week_high)
                    : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">52W Low</span>
                <p className="font-semibold">
                  {stock.fifty_two_week_low
                    ? formatCurrency(stock.fifty_two_week_low)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Price History</h2>
              <div className="flex gap-1">
                {periods.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      period.label === p.label
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {histLoading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : history && history.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={positive ? "#22c55e" : "#ef4444"}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={positive ? "#22c55e" : "#ef4444"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(v) => [formatCurrency(Number(v)), "Close"]}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke={positive ? "#22c55e" : "#ef4444"}
                    fill="url(#colorClose)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-12 text-gray-400">
                No history data available
              </p>
            )}
          </div>

          {/* AI Recommendation */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> AI Analysis
              </h2>
              {!isFetched && (
                <button
                  onClick={() => fetchRec()}
                  disabled={recLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {recLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Get AI Recommendation"
                  )}
                </button>
              )}
            </div>

            {recLoading && (
              <div className="text-center py-8 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Analyzing {symbol}...
              </div>
            )}

            {rec && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <SentimentBadge
                    action={rec.action}
                    confidence={rec.confidence}
                  />
                  <span className="text-sm text-gray-500">
                    Sentiment:{" "}
                    <span className="font-mono">
                      {rec.sentiment_score > 0 ? "+" : ""}
                      {rec.sentiment_score.toFixed(2)}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-gray-700">{rec.reasoning}</p>
                <div className="flex flex-wrap gap-1.5">
                  {rec.key_factors.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* News */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Latest News
            </h2>
            <NewsFeed ticker={symbol} />
          </div>
        </>
      ) : (
        <p className="text-center py-12 text-red-500">
          Could not load stock data for {symbol}
        </p>
      )}
    </div>
  );
}
