import os
from dotenv import load_dotenv

load_dotenv()

_BASE_URI = os.getenv("DATABASE_URL", "postgresql://localhost/diecast_vault")

# Heroku / Railway / Render supply "postgres://" which SQLAlchemy 1.4+ rejects
if _BASE_URI.startswith("postgres://"):
    _BASE_URI = _BASE_URI.replace("postgres://", "postgresql://", 1)


class BaseConfig:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = _BASE_URI
    SQLALCHEMY_ECHO = True  # log SQL in dev


class ProductionConfig(BaseConfig):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = _BASE_URI
    SQLALCHEMY_ECHO = False
    # Connection pool tuning for low-traffic commercial site
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": 5,
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }


class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "TEST_DATABASE_URL", "sqlite:///:memory:"
    )


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}
