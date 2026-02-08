from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    newsapi_key: str = ""
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    cors_origins: str = "http://localhost:5173"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
