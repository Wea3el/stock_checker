import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Brain,
  Search,
  Loader2,
  AlertCircle,
  FileText,
  Square,
} from "lucide-react";
import { useDeepAnalysis } from "../../hooks/useDeepAnalysis";
import DecisionBanner from "./DecisionBanner";
import PipelineProgress from "./PipelineProgress";
import AnalystReportCard from "./AnalystReportCard";
import { InvestmentDebateView, RiskDebateView } from "./DebateView";

export default function DeepAnalysisPage() {
  const { ticker: paramTicker } = useParams<{ ticker?: string }>();
  const [ticker, setTicker] = useState(paramTicker?.toUpperCase() ?? "");
  const { analysis, status, error, runAnalysis, cancel } = useDeepAnalysis();

  // Auto-run if ticker comes from URL params
  useEffect(() => {
    if (paramTicker && status === "idle") {
      setTicker(paramTicker.toUpperCase());
      runAnalysis(paramTicker.toUpperCase());
    }
  }, [paramTicker]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim() || status === "running") return;
    runAnalysis(ticker.trim().toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          Multi-Agent Deep Analysis
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Comprehensive stock analysis powered by a team of AI agents: analysts,
          debaters, trader, and risk manager.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter a ticker symbol (e.g. NVDA)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              disabled={status === "running"}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
          {status === "running" ? (
            <button
              type="button"
              onClick={cancel}
              className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!ticker.trim()}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {status === "completed" ? "Re-analyze" : "Analyze"}
            </button>
          )}
        </form>
      </div>

      {/* Pipeline progress */}
      {(status === "running" || status === "completed") && (
        <PipelineProgress status={status} />
      )}

      {/* Error */}
      {status === "failed" && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-red-800">Analysis failed</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {status === "running" && (
        <div className="text-center py-12 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-lg font-medium">
            Analyzing {ticker}...
          </p>
          <p className="text-sm mt-1">
            The agent team is researching, debating, and forming a recommendation.
          </p>
        </div>
      )}

      {/* Results */}
      {status === "completed" && analysis && (
        <div className="space-y-6">
          {/* Final Decision */}
          <DecisionBanner
            action={analysis.action}
            ticker={analysis.ticker}
            finalDecision={analysis.final_trade_decision}
          />

          {/* Trader Decision */}
          {analysis.trader_decision && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Trader Decision
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {analysis.trader_decision}
              </p>
            </div>
          )}

          {/* Investment Plan */}
          {analysis.investment_plan && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Investment Plan
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {analysis.investment_plan}
              </p>
            </div>
          )}

          {/* Analyst Reports */}
          {analysis.analyst_reports.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Analyst Reports
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.analyst_reports.map((report) => (
                  <AnalystReportCard
                    key={report.analyst_name}
                    report={report}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Investment Debate */}
          {analysis.investment_debate && (
            <InvestmentDebateView debate={analysis.investment_debate} />
          )}

          {/* Risk Debate */}
          {analysis.risk_debate && (
            <RiskDebateView debate={analysis.risk_debate} />
          )}

          <p className="text-xs text-gray-400 text-center">
            Analyzed at {new Date(analysis.analyzed_at).toLocaleString()} &middot;
            This is AI-generated analysis, not financial advice.
          </p>
        </div>
      )}

      {/* Idle state */}
      {status === "idle" && !paramTicker && (
        <div className="text-center py-16 text-gray-400">
          <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-500">
            Enter a ticker symbol to start
          </p>
          <p className="text-sm mt-1">
            The multi-agent system will analyze fundamentals, sentiment, news,
            and technicals, then debate the outlook before making a
            recommendation.
          </p>
        </div>
      )}
    </div>
  );
}
