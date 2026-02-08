"""
Agentic stock analyst using OpenAI function calling.

The agent autonomously decides which tools to call in a multi-step loop:
Think → Act (call tools) → Observe (read results) → Repeat → Respond
"""

import json
from collections.abc import Generator

from openai import OpenAI

from app.config import settings
from app.services import stock_service, news_service, portfolio_service

MAX_ITERATIONS = 10

SYSTEM_PROMPT = """\
You are an expert stock analyst assistant with access to real-time market data tools.

Your approach:
1. When a user asks a question, think about what data you need.
2. Use the available tools to gather real data - never guess at prices or numbers.
3. Call multiple tools in sequence to build a comprehensive picture.
4. For comparisons, fetch data for all relevant stocks before analyzing.
5. For portfolio questions, first check what the user holds, then analyze positions as needed.
6. Always ground your analysis in actual data you retrieve.

Be concise but thorough. Cite specific data points (prices, changes, news headlines).
Always remind users this is AI-generated analysis, not financial advice."""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_stock_price",
            "description": "Get current price, change, market cap, PE ratio, 52-week range for a stock.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string", "description": "Stock ticker symbol, e.g. AAPL"}
                },
                "required": ["ticker"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_price_history",
            "description": "Get historical price data (OHLCV) for a stock over a given period.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string", "description": "Stock ticker symbol"},
                    "period": {
                        "type": "string",
                        "description": "Time period",
                        "enum": ["5d", "1mo", "3mo", "6mo", "1y"],
                    },
                },
                "required": ["ticker"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_stock_news",
            "description": "Get recent news articles about a specific stock ticker.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string", "description": "Stock ticker symbol"}
                },
                "required": ["ticker"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_market_news",
            "description": "Get general stock market news (S&P 500, NASDAQ, Fed, earnings). Use for overall market conditions.",
            "parameters": {
                "type": "object",
                "properties": {},
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_portfolio_holdings",
            "description": "Get the user's current portfolio holdings with symbol, quantity, value, cost basis, and gain/loss.",
            "parameters": {
                "type": "object",
                "properties": {},
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_portfolio_summary",
            "description": "Get a summary of the user's portfolio: total value, total gain/loss, number of holdings.",
            "parameters": {
                "type": "object",
                "properties": {},
                "additionalProperties": False,
            },
        },
    },
]


def _execute_tool(tool_name: str, arguments: dict) -> str:
    """Execute a tool and return the result as a JSON string."""
    try:
        if tool_name == "get_stock_price":
            result = stock_service.get_stock_info(arguments["ticker"].upper())
            return result.model_dump_json()

        elif tool_name == "get_price_history":
            ticker = arguments["ticker"].upper()
            period = arguments.get("period", "1mo")
            points = stock_service.get_price_history(ticker, period)
            # Summarize large datasets to keep context manageable
            if len(points) > 20:
                return json.dumps({
                    "ticker": ticker,
                    "period": period,
                    "data_points": len(points),
                    "first": points[0].model_dump(),
                    "last": points[-1].model_dump(),
                    "high": max(p.close for p in points),
                    "low": min(p.close for p in points),
                    "recent_5": [p.model_dump() for p in points[-5:]],
                })
            return json.dumps([p.model_dump() for p in points])

        elif tool_name == "get_stock_news":
            articles = news_service.get_news(arguments["ticker"].upper(), page_size=5)
            return json.dumps([
                {"title": a.title, "source": a.source, "description": a.description, "published_at": a.published_at}
                for a in articles
            ])

        elif tool_name == "get_market_news":
            articles = news_service.get_market_news(page_size=10)
            return json.dumps([
                {"title": a.title, "source": a.source, "description": a.description}
                for a in articles
            ])

        elif tool_name == "get_portfolio_holdings":
            holdings = portfolio_service.get_holdings()
            return json.dumps([h.model_dump() for h in holdings])

        elif tool_name == "get_portfolio_summary":
            summary = portfolio_service.get_summary()
            return summary.model_dump_json()

        else:
            return json.dumps({"error": f"Unknown tool: {tool_name}"})

    except Exception as e:
        return json.dumps({"error": str(e)})


def run_agent(user_message: str) -> Generator[dict, None, None]:
    """
    The agentic loop. Yields SSE-serializable dicts.

    Each yielded dict has:
      type: "tool_call" | "tool_result" | "response" | "done" | "error"
      content: str
      tool_call: dict | None
      tool_name: str | None
    """
    client = OpenAI(api_key=settings.openai_api_key)

    messages: list[dict] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    for _iteration in range(MAX_ITERATIONS):
        try:
            stream = client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
                tools=TOOLS,
                stream=True,
            )
        except Exception as e:
            yield {"type": "error", "content": str(e)}
            return

        full_content = ""
        tool_calls_acc: dict[int, dict] = {}
        finish_reason = None

        for chunk in stream:
            choice = chunk.choices[0]
            delta = choice.delta
            if choice.finish_reason:
                finish_reason = choice.finish_reason

            # Stream text content
            if delta.content:
                full_content += delta.content
                yield {"type": "response", "content": delta.content}

            # Accumulate tool call deltas
            if delta.tool_calls:
                for tc_delta in delta.tool_calls:
                    idx = tc_delta.index
                    if idx not in tool_calls_acc:
                        tool_calls_acc[idx] = {"id": "", "name": "", "arguments": ""}
                    if tc_delta.id:
                        tool_calls_acc[idx]["id"] = tc_delta.id
                    if tc_delta.function and tc_delta.function.name:
                        tool_calls_acc[idx]["name"] = tc_delta.function.name
                    if tc_delta.function and tc_delta.function.arguments:
                        tool_calls_acc[idx]["arguments"] += tc_delta.function.arguments

        # If the model wants to call tools
        if finish_reason == "tool_calls" or tool_calls_acc:
            assistant_tool_calls = []
            for idx in sorted(tool_calls_acc.keys()):
                tc = tool_calls_acc[idx]
                assistant_tool_calls.append({
                    "id": tc["id"],
                    "type": "function",
                    "function": {"name": tc["name"], "arguments": tc["arguments"]},
                })

            messages.append({
                "role": "assistant",
                "content": full_content or None,
                "tool_calls": assistant_tool_calls,
            })

            # Execute each tool
            for tc_info in assistant_tool_calls:
                tool_name = tc_info["function"]["name"]
                try:
                    arguments = json.loads(tc_info["function"]["arguments"])
                except json.JSONDecodeError:
                    arguments = {}

                yield {
                    "type": "tool_call",
                    "content": f"Calling {tool_name}...",
                    "tool_call": {"id": tc_info["id"], "tool_name": tool_name, "arguments": arguments},
                }

                result = _execute_tool(tool_name, arguments)

                yield {
                    "type": "tool_result",
                    "content": result,
                    "tool_name": tool_name,
                }

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_info["id"],
                    "content": result,
                })

            # Loop continues - OpenAI will see tool results and decide next step
        else:
            # finish_reason == "stop" - final response already streamed
            break

    yield {"type": "done", "content": ""}
