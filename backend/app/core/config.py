from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://genbi_user:genbi_password@db:5432/genbi_db"
    
    # JWT
    SECRET_KEY: str = "openai-api-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4"
    
    # App
    PROJECT_NAME: str = "GenBI Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    model_config = {"env_file": ".env"}

settings = Settings()