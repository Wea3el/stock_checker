from typing import Literal
from pydantic import BaseModel


class Holding(BaseModel):
    account: str = ""
    symbol: str
    description: str = ""
    quantity: float = 0.0
    last_price: float = 0.0
    current_value: float = 0.0
    cost_basis_total: float = 0.0
    gain_loss_dollar: float = 0.0
    gain_loss_percent: float = 0.0


class PortfolioSummary(BaseModel):
    total_value: float = 0.0
    total_gain_loss: float = 0.0
    total_gain_loss_percent: float = 0.0
    num_holdings: int = 0
    holdings: list[Holding] = []


class NewsArticle(BaseModel):
    title: str
    description: str | None = None
    url: str
    source: str = ""
    published_at: str = ""
    image_url: str | None = None


class Recommendation(BaseModel):
    ticker: str
    action: str  # "BUY", "SELL", or "HOLD"
    confidence: float  # 0.0 to 1.0
    reasoning: str
    key_factors: list[str]
    sentiment_score: float  # -1.0 (bearish) to 1.0 (bullish)


class AIRecommendation(BaseModel):
    """Schema used as OpenAI structured output response format."""
    action: str
    confidence: float
    reasoning: str
    key_factors: list[str]
    sentiment_score: float


class BatchAnalyzeRequest(BaseModel):
    tickers: list[str]


class StockInfo(BaseModel):
    ticker: str
    name: str = ""
    price: float = 0.0
    change: float = 0.0
    change_percent: float = 0.0
    market_cap: float | None = None
    pe_ratio: float | None = None
    fifty_two_week_high: float | None = None
    fifty_two_week_low: float | None = None
    volume: int | None = None


class PricePoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


# ---------- Deep Analysis (TradingAgents) schemas ----------

class AnalystReport(BaseModel):
    analyst_name: str
    content: str


class DebateRecord(BaseModel):
    bull_arguments: str = ""
    bear_arguments: str = ""
    judge_decision: str = ""


class RiskDebateRecord(BaseModel):
    aggressive_arguments: str = ""
    conservative_arguments: str = ""
    neutral_arguments: str = ""
    judge_decision: str = ""


class DeepAnalysis(BaseModel):
    ticker: str
    action: str  # "BUY", "SELL", "HOLD"
    analyst_reports: list[AnalystReport] = []
    investment_debate: DebateRecord | None = None
    risk_debate: RiskDebateRecord | None = None
    trader_decision: str = ""
    investment_plan: str = ""
    final_trade_decision: str = ""
    analyzed_at: str = ""


class DeepAnalysisJob(BaseModel):
    job_id: str
    ticker: str
    status: str = "pending"  # pending, running, completed, failed
    result: DeepAnalysis | None = None
    error: str | None = None


class DeepAnalyzeRequest(BaseModel):
    ticker: str


# ---------- Chat / Agent schemas ----------

class ChatRequest(BaseModel):
    message: str


class ToolCallInfo(BaseModel):
    id: str
    tool_name: str
    arguments: dict


class SSEEvent(BaseModel):
    type: Literal["tool_call", "tool_result", "response", "done", "error"]
    content: str = ""
    tool_call: ToolCallInfo | None = None
    tool_name: str | None = None
