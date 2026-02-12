# Stock Checker

A full-stack stock analysis tool powered by **TradingAgents** — a multi-agent LLM framework that simulates a real trading firm. A team of AI analysts (technical, sentiment, news, fundamentals) research a stock, bull and bear researchers debate the outlook, a trader forms a plan, and a risk manager evaluates it before producing a final recommendation.

Also includes quick news-sentiment analysis (via NewsAPI + OpenAI), an agentic AI chat, Fidelity portfolio CSV upload, and interactive price charts.

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Redis** — required by TradingAgents for LangGraph state management
  - Docker: `docker run -d -p 6379:6379 redis`
  - WSL: `sudo apt install redis-server && sudo service redis-server start`
  - Windows native: [Memurai](https://www.memurai.com/)
- API keys: OpenAI (required), NewsAPI (required)

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -e .
```

Create `backend/.env` and add your keys and config:

```
NEWSAPI_KEY=your_newsapi_org_key
OPENAI_API_KEY=sk-your_openai_key
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:5173

# TradingAgents settings
REDIS_URL=redis://localhost:6379
TA_LLM_PROVIDER=openai
TA_DEEP_THINK_LLM=gpt-4o
TA_QUICK_THINK_LLM=gpt-4o-mini
TA_MAX_DEBATE_ROUNDS=1
TA_MAX_RISK_DISCUSS_ROUNDS=1
TA_ENABLED=true
```

Run the backend:

```bash
cd backend
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`

### Start Both

```bash
python start.py
```

## Usage

1. **Dashboard** — Search any ticker for a quick AI-powered buy/sell/hold recommendation, view top picks, and auto-analyze your portfolio
2. **AI Analyst Chat** — Conversational agent that can look up prices, news, portfolio data, and run deep multi-agent analysis on demand
3. **Deep Analysis** — Dedicated page for TradingAgents multi-agent analysis: see analyst reports, bull/bear debate, risk assessment, and final trading decision
4. **Portfolio** — Upload a `Portfolio_Positions.csv` exported from Fidelity.com, then analyze all holdings
5. **News** — Browse recent news articles for any ticker or the overall market
6. **Stock Detail** — View price charts, key stats, AI analysis, news, and launch deep analysis for any stock

## Architecture

### Multi-Agent Deep Analysis (TradingAgents)

The deep analysis pipeline runs through these stages:

1. **Analyst Team** — Four specialized AI analysts research the stock in parallel:
   - Technical/Market Analyst (price patterns, indicators)
   - Sentiment Analyst (social media, public sentiment)
   - News Analyst (recent headlines, macro events)
   - Fundamentals Analyst (financials, valuation metrics)
2. **Research Debate** — Bullish and bearish researchers debate the outlook using analyst findings
3. **Trader Decision** — A trader agent synthesizes everything into a trading plan
4. **Risk Assessment** — Aggressive, conservative, and neutral risk agents evaluate the plan
5. **Final Decision** — BUY, SELL, or HOLD with full reasoning

Results are cached for 1 hour. Each analysis takes 1-2 minutes (multiple LLM calls).

### Quick Analysis

Uses a single OpenAI structured-output call with recent news to produce a fast buy/sell/hold signal. Used for batch portfolio analysis and the top picks leaderboard.

## Tech Stack

- **Backend**: FastAPI, TradingAgents (LangGraph multi-agent framework), OpenAI, yfinance, NewsAPI, Redis
- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS v4, TanStack React Query, Recharts, Lucide icons

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/stream` | SSE streaming agentic chat |
| POST | `/api/deep-analysis/start` | Start a TradingAgents deep analysis job |
| GET | `/api/deep-analysis/job/{id}` | Poll job status/result |
| GET | `/api/deep-analysis/result/{ticker}` | Get cached deep analysis |
| POST | `/api/deep-analysis/stream` | SSE streaming deep analysis |
| GET | `/api/stocks/{ticker}` | Stock info |
| GET | `/api/stocks/{ticker}/history` | Price history |
| GET | `/api/news/{ticker}` | Ticker news |
| GET | `/api/news/market` | Market news |
| POST | `/api/portfolio/upload` | Upload Fidelity CSV |
| GET | `/api/portfolio/holdings` | Portfolio holdings |
| GET | `/api/portfolio/summary` | Portfolio summary |
| GET | `/api/recommendations/{ticker}` | Quick AI recommendation |
| GET | `/api/recommendations/top-picks` | Top 10 buy signals |
| POST | `/api/recommendations/analyze` | Batch analyze tickers |

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `OPENAI_API_KEY` | (required) | OpenAI API key |
| `NEWSAPI_KEY` | (required) | NewsAPI.org key |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model for chat agent and quick analysis |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `TA_LLM_PROVIDER` | `openai` | LLM provider for TradingAgents (`openai`, `anthropic`, `google`) |
| `TA_DEEP_THINK_LLM` | `gpt-4o` | Model for complex reasoning (debates, analysis) |
| `TA_QUICK_THINK_LLM` | `gpt-4o-mini` | Model for quick tasks (signal processing) |
| `TA_MAX_DEBATE_ROUNDS` | `1` | Bull/bear debate iterations |
| `TA_MAX_RISK_DISCUSS_ROUNDS` | `1` | Risk assessment iterations |
| `TA_ENABLED` | `true` | Feature flag to disable deep analysis |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed CORS origins |
