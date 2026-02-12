export interface Holding {
  account: string;
  symbol: string;
  description: string;
  quantity: number;
  last_price: number;
  current_value: number;
  cost_basis_total: number;
  gain_loss_dollar: number;
  gain_loss_percent: number;
}

export interface PortfolioSummary {
  total_value: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  num_holdings: number;
  holdings: Holding[];
}

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  source: string;
  published_at: string;
  image_url: string | null;
}

export interface Recommendation {
  ticker: string;
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reasoning: string;
  key_factors: string[];
  sentiment_score: number;
}

export interface StockInfo {
  ticker: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  market_cap: number | null;
  pe_ratio: number | null;
  fifty_two_week_high: number | null;
  fifty_two_week_low: number | null;
  volume: number | null;
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ---------- Deep Analysis (TradingAgents) types ----------

export interface AnalystReport {
  analyst_name: string;
  content: string;
}

export interface DebateRecord {
  bull_arguments: string;
  bear_arguments: string;
  judge_decision: string;
}

export interface RiskDebateRecord {
  aggressive_arguments: string;
  conservative_arguments: string;
  neutral_arguments: string;
  judge_decision: string;
}

export interface DeepAnalysis {
  ticker: string;
  action: "BUY" | "SELL" | "HOLD";
  analyst_reports: AnalystReport[];
  investment_debate: DebateRecord | null;
  risk_debate: RiskDebateRecord | null;
  trader_decision: string;
  investment_plan: string;
  final_trade_decision: string;
  analyzed_at: string;
}

export interface DeepAnalysisJob {
  job_id: string;
  ticker: string;
  status: "pending" | "running" | "completed" | "failed";
  result: DeepAnalysis | null;
  error: string | null;
}

export interface DeepAnalysisSSEEvent {
  type: "started" | "progress" | "completed" | "error";
  job_id?: string;
  ticker?: string;
  status?: string;
  result?: DeepAnalysis;
  content?: string;
}

// ---------- Chat / Agent types ----------

export interface ToolCallInfo {
  id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
}

export interface SSEEvent {
  type: "tool_call" | "tool_result" | "response" | "done" | "error";
  content: string;
  tool_call?: ToolCallInfo;
  tool_name?: string;
}

export interface ToolCallStep {
  toolName: string;
  arguments: Record<string, unknown>;
  result?: string;
  status: "calling" | "done" | "error";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCallStep[];
  isStreaming?: boolean;
}
