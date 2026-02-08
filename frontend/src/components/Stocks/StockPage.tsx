import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function StockPage() {
  const [ticker, setTicker] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      navigate(`/stocks/${ticker.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Stock Lookup</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Enter ticker symbol (e.g. AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={!ticker.trim()}
          className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          Look Up
        </button>
      </form>

      <div className="text-center py-16 text-gray-400">
        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium text-gray-500">
          Search for a stock
        </p>
        <p className="text-sm mt-1">
          Enter a ticker symbol to see price data, charts, and AI analysis
        </p>
      </div>
    </div>
  );
}
