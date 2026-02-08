import yfinance as yf
from cachetools import TTLCache

from app.models.schemas import StockInfo, PricePoint

_cache: TTLCache = TTLCache(maxsize=256, ttl=900)


def get_stock_info(ticker: str) -> StockInfo:
    cache_key = f"info:{ticker}"
    if cache_key in _cache:
        return _cache[cache_key]

    stock = yf.Ticker(ticker)
    info = stock.info

    previous_close = info.get("previousClose") or info.get("regularMarketPreviousClose", 0)
    current_price = info.get("currentPrice") or info.get("regularMarketPrice", 0)
    change = current_price - previous_close if previous_close else 0
    change_pct = (change / previous_close * 100) if previous_close else 0

    result = StockInfo(
        ticker=ticker.upper(),
        name=info.get("shortName", ""),
        price=current_price,
        change=round(change, 2),
        change_percent=round(change_pct, 2),
        market_cap=info.get("marketCap"),
        pe_ratio=info.get("trailingPE"),
        fifty_two_week_high=info.get("fiftyTwoWeekHigh"),
        fifty_two_week_low=info.get("fiftyTwoWeekLow"),
        volume=info.get("volume"),
    )
    _cache[cache_key] = result
    return result


def get_price_history(ticker: str, period: str = "1mo", interval: str = "1d") -> list[PricePoint]:
    cache_key = f"hist:{ticker}:{period}:{interval}"
    if cache_key in _cache:
        return _cache[cache_key]

    stock = yf.Ticker(ticker)
    df = stock.history(period=period, interval=interval)

    points: list[PricePoint] = []
    for date, row in df.iterrows():
        points.append(
            PricePoint(
                date=str(date.date()) if hasattr(date, "date") else str(date),
                open=round(row["Open"], 2),
                high=round(row["High"], 2),
                low=round(row["Low"], 2),
                close=round(row["Close"], 2),
                volume=int(row["Volume"]),
            )
        )

    _cache[cache_key] = points
    return points
