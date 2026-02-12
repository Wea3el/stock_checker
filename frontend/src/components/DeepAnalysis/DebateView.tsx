import { Gavel, TrendingUp, TrendingDown, Shield } from "lucide-react";
import type { DebateRecord, RiskDebateRecord } from "../../types";

interface InvestmentDebateProps {
  debate: DebateRecord;
}

export function InvestmentDebateView({ debate }: InvestmentDebateProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Gavel className="w-5 h-5 text-gray-600" />
        Investment Debate
      </h3>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Bull side */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800 text-sm">
              Bull Case
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {debate.bull_arguments || "No bull arguments recorded."}
          </p>
        </div>
        {/* Bear side */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="font-medium text-red-800 text-sm">
              Bear Case
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {debate.bear_arguments || "No bear arguments recorded."}
          </p>
        </div>
      </div>
      {debate.judge_decision && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Gavel className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-800 text-sm">
              Judge Verdict
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {debate.judge_decision}
          </p>
        </div>
      )}
    </div>
  );
}

interface RiskDebateProps {
  debate: RiskDebateRecord;
}

export function RiskDebateView({ debate }: RiskDebateProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-gray-600" />
        Risk Assessment Debate
      </h3>
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {/* Aggressive */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <span className="font-medium text-red-800 text-sm block mb-2">
            Aggressive
          </span>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {debate.aggressive_arguments || "No arguments recorded."}
          </p>
        </div>
        {/* Conservative */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <span className="font-medium text-blue-800 text-sm block mb-2">
            Conservative
          </span>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {debate.conservative_arguments || "No arguments recorded."}
          </p>
        </div>
        {/* Neutral */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <span className="font-medium text-gray-800 text-sm block mb-2">
            Neutral
          </span>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {debate.neutral_arguments || "No arguments recorded."}
          </p>
        </div>
      </div>
      {debate.judge_decision && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Gavel className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-800 text-sm">
              Risk Judge Verdict
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {debate.judge_decision}
          </p>
        </div>
      )}
    </div>
  );
}
