from openai import OpenAI
from cachetools import TTLCache

from app.config import settings
from app.models.schemas import AIRecommendation, Recommendation, NewsArticle

_cache: TTLCache = TTLCache(maxsize=256, ttl=900)


def _get_client() -> OpenAI:
    return OpenAI(api_key=settings.openai_api_key)


def analyze_ticker(
    ticker: str,
    articles: list[NewsArticle],
    current_price: float = 0.0,
) -> Recommendation:
    cache_key = f"rec:{ticker}"
    if cache_key in _cache:
        return _cache[cache_key]

    client = _get_client()

    news_summary = "\n".join(
        f"- [{a.source}] {a.title}: {a.description or 'No description'}"
        for a in articles[:10]
    )

    prompt = (
        f"You are a stock analyst. Analyze the following recent news for {ticker} "
        f"(current price: ${current_price:.2f}) and provide an investment recommendation.\n\n"
        f"Recent news:\n{news_summary}\n\n"
        f"Provide your analysis as a JSON object with:\n"
        f'- action: exactly one of "BUY", "SELL", or "HOLD"\n'
        f"- confidence: float 0.0-1.0\n"
        f"- reasoning: 2-3 sentence explanation\n"
        f"- key_factors: list of 3-5 key factors\n"
        f"- sentiment_score: float -1.0 (bearish) to 1.0 (bullish)"
    )

    response = client.beta.chat.completions.parse(
        model=settings.openai_model,
        messages=[{"role": "user", "content": prompt}],
        response_format=AIRecommendation,
    )

    ai_rec = response.choices[0].message.parsed
    result = Recommendation(
        ticker=ticker.upper(),
        action=ai_rec.action,
        confidence=ai_rec.confidence,
        reasoning=ai_rec.reasoning,
        key_factors=ai_rec.key_factors,
        sentiment_score=ai_rec.sentiment_score,
    )

    _cache[cache_key] = result
    return result
