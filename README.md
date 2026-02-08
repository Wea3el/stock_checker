# Stock Checker

A full-stack stock analysis tool that uses news sentiment (via NewsAPI + OpenAI) to generate buy/sell/hold recommendations, with Fidelity portfolio CSV upload support.

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # macOS/Linux
pip install .
```

Create `backend/.env` from `.env.example` and add your API keys:

```
NEWSAPI_KEY=your_newsapi_org_key
OPENAI_API_KEY=sk-your_openai_key
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:5173
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

## Usage

1. **Dashboard** - Search any ticker for an AI-powered buy/sell/hold recommendation
2. **Portfolio** - Upload a `Portfolio_Positions.csv` exported from Fidelity.com, then analyze all holdings at once
3. **News** - Browse recent news articles for any ticker
4. **Stock Detail** - View price charts, key stats, AI analysis, and news for any stock

## Tech Stack

- **Backend**: FastAPI, yfinance, NewsAPI, OpenAI (structured outputs)
- **Frontend**: React, TypeScript, Vite, TailwindCSS, TanStack React Query, Recharts
