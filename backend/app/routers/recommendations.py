from fastapi import APIRouter, HTTPException
from cachetools import TTLCache

from app.models.schemas import Recommendation, BatchAnalyzeRequest
from app.services import ai_service, news_service, stock_service

router = APIRouter()

_top_picks_cache: TTLCache = TTLCache(maxsize=1, ttl=900)

# Well-known stocks across sectors
POPULAR_TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX",
    "JPM", "V", "JNJ", "WMT", "DIS", "BA", "AMD", "CRM", "PYPL",
    "INTC", "KO", "PEP",
]


@router.get("/top-picks", response_model=list[Recommendation])
def get_top_picks():
    if "top" in _top_picks_cache:
        return _top_picks_cache["top"]

    results: list[Recommendation] = []
    for ticker in POPULAR_TICKERS:
        try:
            articles = news_service.get_news(ticker, page_size=5)
            info = stock_service.get_stock_info(ticker)
            rec = ai_service.analyze_ticker(ticker, articles, current_price=info.price)
            results.append(rec)
        except Exception:
            continue

    # Sort by: BUY first, then by confidence descending, take top 10
    buy_recs = [r for r in results if r.action == "BUY"]
    buy_recs.sort(key=lambda r: r.confidence, reverse=True)

    # If fewer than 10 buys, pad with high-confidence HOLDs
    if len(buy_recs) < 10:
        holds = [r for r in results if r.action == "HOLD"]
        holds.sort(key=lambda r: r.sentiment_score, reverse=True)
        buy_recs.extend(holds)

    top = buy_recs[:10]
    _top_picks_cache["top"] = top
    return top


@router.get("/{ticker}", response_model=Recommendation)
def get_recommendation(ticker: str):
    ticker = ticker.upper()
    try:
        articles = news_service.get_news(ticker)
        info = stock_service.get_stock_info(ticker)
        return ai_service.analyze_ticker(ticker, articles, current_price=info.price)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis error: {e}")


@router.post("/analyze", response_model=list[Recommendation])
def batch_analyze(request: BatchAnalyzeRequest):
    results: list[Recommendation] = []
    for ticker in request.tickers:
        ticker = ticker.upper()
        try:
            articles = news_service.get_news(ticker)
            info = stock_service.get_stock_info(ticker)
            rec = ai_service.analyze_ticker(ticker, articles, current_price=info.price)
            results.append(rec)
        except Exception:
            continue
    return results
