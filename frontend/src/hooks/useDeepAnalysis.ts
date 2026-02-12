import { useState, useCallback, useRef } from "react";
import { streamDeepAnalysis } from "../api/client";
import type { DeepAnalysis, DeepAnalysisSSEEvent } from "../types";

export function useDeepAnalysis() {
  const [analysis, setAnalysis] = useState<DeepAnalysis | null>(null);
  const [status, setStatus] = useState<
    "idle" | "running" | "completed" | "failed"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runAnalysis = useCallback(async (ticker: string) => {
    setStatus("running");
    setAnalysis(null);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamDeepAnalysis(
        ticker,
        (event: DeepAnalysisSSEEvent) => {
          switch (event.type) {
            case "started":
              setStatus("running");
              break;
            case "progress":
              setStatus("running");
              break;
            case "completed":
              setAnalysis(event.result ?? null);
              setStatus("completed");
              break;
            case "error":
              setError(event.content ?? "Analysis failed");
              setStatus("failed");
              break;
          }
        },
        controller.signal
      );
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Connection error");
        setStatus("failed");
      }
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
  }, []);

  return { analysis, status, error, runAnalysis, cancel };
}
