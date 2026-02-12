"""
TradingAgents integration service.

Wraps the TradingAgents multi-agent framework for deep stock analysis.
Runs analyses as background jobs since each propagate() call chains through
multiple LLM invocations (analysts, debaters, trader, risk manager) and
can take 30-120 seconds.
"""

import asyncio
import json
import os
import uuid
from datetime import date, datetime

from cachetools import TTLCache

from app.config import settings
from app.models.schemas import (
    AnalystReport,
    DebateRecord,
    DeepAnalysis,
    DeepAnalysisJob,
    Recommendation,
    RiskDebateRecord,
)

# 1-hour cache for completed analyses (TradingAgents is expensive)
_cache: TTLCache = TTLCache(maxsize=128, ttl=3600)

# In-memory job store: job_id -> DeepAnalysisJob
_jobs: dict[str, DeepAnalysisJob] = {}

# Singleton TradingAgentsGraph instance (initialized lazily)
_ta_graph = None


def _get_graph():
    """Lazily initialize TradingAgentsGraph singleton."""
    global _ta_graph
    if _ta_graph is None:
        # LangChain/TradingAgents reads API keys from env vars directly,
        # so we must ensure they are set before initializing the graph.
        if settings.openai_api_key:
            os.environ["OPENAI_API_KEY"] = settings.openai_api_key

        from tradingagents.default_config import DEFAULT_CONFIG
        from tradingagents.graph.trading_graph import TradingAgentsGraph

        config = DEFAULT_CONFIG.copy()
        config["llm_provider"] = settings.ta_llm_provider
        config["deep_think_llm"] = settings.ta_deep_think_llm
        config["quick_think_llm"] = settings.ta_quick_think_llm
        config["max_debate_rounds"] = settings.ta_max_debate_rounds
        config["max_risk_discuss_rounds"] = settings.ta_max_risk_discuss_rounds

        _ta_graph = TradingAgentsGraph(
            selected_analysts=["market", "social", "news", "fundamentals"],
            debug=False,
            config=config,
        )
    return _ta_graph


def _parse_state_to_deep_analysis(
    ticker: str, state: dict, decision: str
) -> DeepAnalysis:
    """Parse TradingAgents state dict into our structured DeepAnalysis schema."""
    analyst_reports = []
    for report_key, analyst_name in [
        ("market_report", "Technical/Market Analyst"),
        ("sentiment_report", "Sentiment Analyst"),
        ("news_report", "News Analyst"),
        ("fundamentals_report", "Fundamentals Analyst"),
    ]:
        content = state.get(report_key, "")
        if content:
            analyst_reports.append(
                AnalystReport(analyst_name=analyst_name, content=str(content))
            )

    # Extract investment debate (bull vs bear)
    investment_debate = None
    debate_state = state.get("investment_debate_state", {})
    if debate_state and isinstance(debate_state, dict):
        investment_debate = DebateRecord(
            bull_arguments=str(debate_state.get("bull_history", "")),
            bear_arguments=str(debate_state.get("bear_history", "")),
            judge_decision=str(debate_state.get("judge_decision", "")),
        )

    # Extract risk debate (aggressive vs conservative vs neutral)
    risk_debate = None
    risk_state = state.get("risk_debate_state", {})
    if risk_state and isinstance(risk_state, dict):
        risk_debate = RiskDebateRecord(
            aggressive_arguments=str(risk_state.get("aggressive_history", "")),
            conservative_arguments=str(risk_state.get("conservative_history", "")),
            neutral_arguments=str(risk_state.get("neutral_history", "")),
            judge_decision=str(risk_state.get("judge_decision", "")),
        )

    trader_decision = str(state.get("trader_investment_plan", ""))
    investment_plan = str(state.get("investment_plan", ""))
    final_trade_decision = str(state.get("final_trade_decision", ""))

    action = decision.strip().upper()
    if action not in ("BUY", "SELL", "HOLD"):
        action = "HOLD"

    return DeepAnalysis(
        ticker=ticker.upper(),
        action=action,
        analyst_reports=analyst_reports,
        investment_debate=investment_debate,
        risk_debate=risk_debate,
        trader_decision=trader_decision,
        investment_plan=investment_plan,
        final_trade_decision=final_trade_decision,
        analyzed_at=datetime.utcnow().isoformat(),
    )


def _run_analysis_sync(ticker: str, trade_date: str) -> DeepAnalysis:
    """Synchronous call to TradingAgents propagate().
    Called via asyncio.to_thread() so it doesn't block the event loop."""
    graph = _get_graph()
    state, decision = graph.propagate(ticker, trade_date)
    return _parse_state_to_deep_analysis(ticker, state, decision)


async def start_analysis(ticker: str) -> str:
    """Start a deep analysis job. Returns the job_id."""
    ticker = ticker.upper()

    # Check cache first
    cache_key = f"deep:{ticker}"
    if cache_key in _cache:
        job_id = str(uuid.uuid4())
        _jobs[job_id] = DeepAnalysisJob(
            job_id=job_id,
            ticker=ticker,
            status="completed",
            result=_cache[cache_key],
        )
        return job_id

    # Check if already running for this ticker
    for jid, job in _jobs.items():
        if job.ticker == ticker and job.status in ("pending", "running"):
            return jid

    job_id = str(uuid.uuid4())
    _jobs[job_id] = DeepAnalysisJob(
        job_id=job_id,
        ticker=ticker,
        status="pending",
    )

    asyncio.create_task(_run_analysis_background(job_id, ticker))
    return job_id


async def _run_analysis_background(job_id: str, ticker: str):
    """Background coroutine that runs TradingAgents in a thread."""
    job = _jobs[job_id]
    job.status = "running"
    trade_date = date.today().isoformat()

    try:
        result = await asyncio.to_thread(_run_analysis_sync, ticker, trade_date)
        job.status = "completed"
        job.result = result
        _cache[f"deep:{ticker}"] = result
    except Exception as e:
        job.status = "failed"
        job.error = str(e)


def get_job(job_id: str) -> DeepAnalysisJob | None:
    """Get the status/result of an analysis job."""
    return _jobs.get(job_id)


def get_cached_analysis(ticker: str) -> DeepAnalysis | None:
    """Get cached analysis if available."""
    return _cache.get(f"deep:{ticker.upper()}")


def deep_analysis_to_recommendation(analysis: DeepAnalysis) -> Recommendation:
    """Convert a DeepAnalysis into the existing Recommendation schema."""
    key_factors = []
    for report in analysis.analyst_reports:
        first_sentence = report.content.split(".")[0].strip()
        if first_sentence and len(first_sentence) < 200:
            key_factors.append(f"[{report.analyst_name}] {first_sentence}")

    sentiment_map = {"BUY": 0.7, "HOLD": 0.0, "SELL": -0.7}
    sentiment = sentiment_map.get(analysis.action, 0.0)

    return Recommendation(
        ticker=analysis.ticker,
        action=analysis.action,
        confidence=0.85,
        reasoning=(
            analysis.final_trade_decision[:500]
            if analysis.final_trade_decision
            else "Multi-agent deep analysis"
        ),
        key_factors=key_factors[:5],
        sentiment_score=sentiment,
    )
