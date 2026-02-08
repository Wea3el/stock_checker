import { useState, useRef, useEffect } from "react";
import { Send, Square, Trash2, Bot } from "lucide-react";
import { useChat } from "../../hooks/useChat";
import ChatBubble from "./ChatBubble";
import ToolCallDisplay from "./ToolCallDisplay";

const SUGGESTIONS = [
  "What's happening with NVDA today?",
  "Should I buy or sell AAPL?",
  "Compare MSFT vs GOOGL",
  "What are the best stocks in my portfolio?",
  "What's the market sentiment today?",
];

export default function ChatPage() {
  const { messages, isStreaming, sendMessage, stopStreaming, clearMessages } =
    useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          AI Stock Analyst
        </h1>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-blue-200 mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Ask me anything about stocks
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              I can look up prices, analyze news sentiment, check your
              portfolio, and compare stocks. I'll show you my research process
              as I work.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "assistant" &&
                msg.toolCalls &&
                msg.toolCalls.length > 0 && (
                  <ToolCallDisplay toolCalls={msg.toolCalls} />
                )}
              <ChatBubble message={msg} />
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 pt-4 border-t border-gray-200"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about any stock, your portfolio, or market conditions..."
          disabled={isStreaming}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={stopStreaming}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
}
