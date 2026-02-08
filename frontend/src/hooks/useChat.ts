import { useState, useCallback, useRef } from "react";
import { streamChat } from "../api/client";
import type { ChatMessage, ToolCallStep, SSEEvent } from "../types";

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: ChatMessage = {
        id: genId(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      const assistantId = genId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        toolCalls: [],
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChat(
          text,
          (event: SSEEvent) => {
            setMessages((prev) => {
              const updated = [...prev];
              const idx = updated.findIndex((m) => m.id === assistantId);
              if (idx === -1) return prev;
              const msg = { ...updated[idx] };

              switch (event.type) {
                case "response":
                  msg.content += event.content;
                  break;

                case "tool_call": {
                  const step: ToolCallStep = {
                    toolName: event.tool_call!.tool_name,
                    arguments: event.tool_call!.arguments,
                    status: "calling",
                  };
                  msg.toolCalls = [...(msg.toolCalls ?? []), step];
                  break;
                }

                case "tool_result": {
                  const calls = [...(msg.toolCalls ?? [])];
                  for (let i = calls.length - 1; i >= 0; i--) {
                    if (
                      calls[i].toolName === event.tool_name &&
                      calls[i].status === "calling"
                    ) {
                      calls[i] = { ...calls[i], result: event.content, status: "done" };
                      break;
                    }
                  }
                  msg.toolCalls = calls;
                  break;
                }

                case "done":
                  msg.isStreaming = false;
                  break;

                case "error":
                  msg.content += `\n\nError: ${event.content}`;
                  msg.isStreaming = false;
                  break;
              }

              updated[idx] = msg;
              return updated;
            });
          },
          controller.signal
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + "\n\nConnection error.", isStreaming: false }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isStreaming, sendMessage, stopStreaming, clearMessages };
}
