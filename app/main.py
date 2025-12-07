from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import create_tables
from app.core.config import settings
import logging
logging.basicConfig(level=logging.DEBUG)

#  Импортируем роуты авторизации
from app.routes import animals, auth

# Создаем таблицы (включая users!)
create_tables()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API для поиска потерянных и найденных животных с авторизацией",
    version=settings.VERSION,
    # Добавляем контакты для документации
    contact={
        "name": "Animal Finder Team",
        "email": "support@animalfinder.com",
    },
)

#  Улучшаем CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        # "http://localhost:5173",  # Vite dev server
        # "http://127.0.0.1:3000",  # Альтернальный адрес
        # "http://127.0.0.1:5173",  # Альтернальный адрес
    ],
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Authorization, Content-Type, etc.
)

# ПОДКЛЮЧАЕМ РОУТЫ АВТОРИЗАЦИИ
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])

# Существующие роуты животных
app.include_router(animals.router, prefix="/api/animals", tags=["animals"])

@app.get("/")
async def root():
    return {"message": "Animal Finder API работает! 🐾"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

# Добавляем эндпоинт для проверки конфигурации (для отладки)
@app.get("/config-check")
async def config_check():
    """Проверка конфигурации (только для разработки)"""
    return {
        "project_name": settings.PROJECT_NAME,
        "jwt_algorithm": settings.ALGORITHM,
        "access_token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        "refresh_token_expire_days": settings.REFRESH_TOKEN_EXPIRE_DAYS,
        "secret_key_set": bool(settings.SECRET_KEY and settings.SECRET_KEY != "fallback-secret-key-for-dev")
    }