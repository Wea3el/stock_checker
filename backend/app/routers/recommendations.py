from fastapi import APIRouter, HTTPException

from app.models.schemas import Recommendation, BatchAnalyzeRequest
from app.services import ai_service, news_service, stock_service

router = APIRouter()


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
            # Skip tickers that fail, include what we can
            continue
    return results
