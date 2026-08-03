"""
Application configuration settings
Loads from environment variables
"""

from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application Info
    app_name: str = "Finance Manager"
    app_version: str = "0.1.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # MongoDB
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    mongodb_db_name: str = os.getenv("MONGODB_DB_NAME", "finance_manager")
    
    # Security & Authentication
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Encryption for sensitive files
    encryption_key: str = os.getenv("ENCRYPTION_KEY", "dev-encryption-key")
    enable_password_protection: bool = True
    password_hash_rounds: int = 12
    allow_file_encryption: bool = True
    
    # API Configuration
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    
    # File Upload Configuration
    max_upload_size_mb: int = 50
    max_upload_size_bytes: int = 50 * 1024 * 1024
    allowed_extensions: List[str] = ["csv", "xlsx", "pdf"]
    upload_directory: Path = Path(os.getenv("UPLOAD_DIRECTORY", "./uploads"))
    
    # CORS Settings
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_file: str = os.getenv("LOG_FILE", "./logs/app.log")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    def __init__(self, **data):
        super().__init__(**data)
        # Create upload and logs directories if they don't exist
        self.upload_directory.mkdir(parents=True, exist_ok=True)
        Path(self.log_file).parent.mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()
