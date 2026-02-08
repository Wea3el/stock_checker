from fastapi import APIRouter, HTTPException

from app.models.schemas import NewsArticle
from app.services import news_service

router = APIRouter()


@router.get("/market", response_model=list[NewsArticle])
def get_market_news(page_size: int = 20):
    try:
        return news_service.get_market_news(page_size=page_size)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"News API error: {e}")


@router.get("/{ticker}", response_model=list[NewsArticle])
def get_news(ticker: str, page_size: int = 10):
    try:
        return news_service.get_news(ticker.upper(), page_size=page_size)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"News API error: {e}")
