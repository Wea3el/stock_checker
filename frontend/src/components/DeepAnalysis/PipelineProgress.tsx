import { Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  status: "idle" | "running" | "completed" | "failed";
}

const STEPS = [
  { label: "Analysts", description: "Technical, Sentiment, News, Fundamentals" },
  { label: "Debate", description: "Bull vs Bear arguments" },
  { label: "Trader", description: "Trading decision" },
  { label: "Risk", description: "Risk assessment" },
  { label: "Decision", description: "Final recommendation" },
];

export default function PipelineProgress({ status }: Props) {
  if (status === "idle") return null;

  const isCompleted = status === "completed";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        {isCompleted ? "Analysis Complete" : "Multi-Agent Analysis Pipeline"}
      </h3>
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center text-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                  isCompleted
                    ? "bg-green-100 text-green-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Loader2 className="w-5 h-5 animate-spin" />
                )}
              </div>
              <span className="text-xs font-medium text-gray-700">
                {step.label}
              </span>
              <span className="text-[10px] text-gray-400">
                {step.description}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-4 shrink-0 -mt-5 ${
                  isCompleted ? "bg-green-300" : "bg-blue-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      {!isCompleted && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Running multi-agent analysis... this typically takes 1-2 minutes.
        </p>
      )}
    </div>
  );
}
