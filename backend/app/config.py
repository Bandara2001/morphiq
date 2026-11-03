from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Morphiq API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    FRONTEND_URL: str = "http://localhost:3000"

    SUPABASE_URL: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""
    SUPABASE_SECRET_KEY: str = ""

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()