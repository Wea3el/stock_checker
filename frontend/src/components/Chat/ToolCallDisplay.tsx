import { useState } from "react";
import { ChevronDown, ChevronRight, Wrench, Check, Loader2 } from "lucide-react";
import type { ToolCallStep } from "../../types";

const TOOL_LABELS: Record<string, string> = {
  get_stock_price: "Looking up stock price",
  get_price_history: "Fetching price history",
  get_stock_news: "Searching news",
  get_market_news: "Checking market news",
  get_portfolio_holdings: "Reading portfolio",
  get_portfolio_summary: "Analyzing portfolio",
};

export default function ToolCallDisplay({ toolCalls }: { toolCalls: ToolCallStep[] }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (i: number) =>
    setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="ml-11 mt-2 space-y-1.5">
      {toolCalls.map((tc, i) => (
        <div key={i} className="border border-gray-100 rounded-lg bg-gray-50 text-xs">
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 transition-colors rounded-lg"
          >
            {tc.status === "calling" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 shrink-0" />
            ) : (
              <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
            )}
            <Wrench className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="font-medium text-gray-700">
              {TOOL_LABELS[tc.toolName] ?? tc.toolName}
            </span>
            {tc.arguments && Object.keys(tc.arguments).length > 0 && (
              <span className="text-gray-400">
                ({Object.values(tc.arguments).join(", ")})
              </span>
            )}
            <span className="ml-auto shrink-0">
              {expanded[i] ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          </button>
          {expanded[i] && tc.result && (
            <div className="px-3 pb-2">
              <pre className="bg-white border border-gray-200 rounded p-2 overflow-x-auto text-[11px] text-gray-600 max-h-40 overflow-y-auto">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(tc.result), null, 2);
                  } catch {
                    return tc.result;
                  }
                })()}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
