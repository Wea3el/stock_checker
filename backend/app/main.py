from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import chat, deep_analysis, news, portfolio, recommendations, stocks

app = FastAPI(title="Stock Checker API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio.router, prefix="/api/portfolio", tags=["portfolio"])
app.include_router(news.router, prefix="/api/news", tags=["news"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(stocks.router, prefix="/api/stocks", tags=["stocks"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(deep_analysis.router, prefix="/api/deep-analysis", tags=["deep-analysis"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
