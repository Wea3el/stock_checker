from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    newsapi_key: str = ""
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    cors_origins: str = "http://localhost:5173"

    # TradingAgents settings
    redis_url: str = "redis://localhost:6379"
    ta_llm_provider: str = "openai"
    ta_deep_think_llm: str = "gpt-4o"
    ta_quick_think_llm: str = "gpt-4o-mini"
    ta_max_debate_rounds: int = 1
    ta_max_risk_discuss_rounds: int = 1
    ta_enabled: bool = True

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
