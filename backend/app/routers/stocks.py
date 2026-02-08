from fastapi import APIRouter, HTTPException

from app.models.schemas import StockInfo, PricePoint
from app.services import stock_service

router = APIRouter()


@router.get("/{ticker}", response_model=StockInfo)
def get_stock(ticker: str):
    try:
        return stock_service.get_stock_info(ticker.upper())
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Stock data error: {e}")


@router.get("/{ticker}/history", response_model=list[PricePoint])
def get_history(ticker: str, period: str = "1mo", interval: str = "1d"):
    try:
        return stock_service.get_price_history(ticker.upper(), period=period, interval=interval)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"History error: {e}")
