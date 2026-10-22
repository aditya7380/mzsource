"""
Central configuration, loaded from environment variables / .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "sqlite:///./mzsource.db"

    JWT_SECRET_KEY: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    BUYER_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    ADMIN_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"

    DEMO_OTP_BYPASS: bool = True
    DEMO_OTP_CODE: str = "123456"


settings = Settings()
