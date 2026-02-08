from newsapi import NewsApiClient
from cachetools import TTLCache

from app.config import settings
from app.models.schemas import NewsArticle

_cache: TTLCache = TTLCache(maxsize=256, ttl=900)  # 15-min cache


def _get_client() -> NewsApiClient:
    return NewsApiClient(api_key=settings.newsapi_key)


def get_news(ticker: str, page_size: int = 10) -> list[NewsArticle]:
    cache_key = f"news:{ticker}:{page_size}"
    if cache_key in _cache:
        return _cache[cache_key]

    client = _get_client()
    response = client.get_everything(
        q=ticker,
        language="en",
        sort_by="publishedAt",
        page_size=page_size,
    )

    articles: list[NewsArticle] = []
    for article in response.get("articles", []):
        articles.append(
            NewsArticle(
                title=article.get("title", ""),
                description=article.get("description"),
                url=article.get("url", ""),
                source=article.get("source", {}).get("name", ""),
                published_at=article.get("publishedAt", ""),
                image_url=article.get("urlToImage"),
            )
        )

    _cache[cache_key] = articles
    return articles
