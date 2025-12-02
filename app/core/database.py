from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv


# Загружаем переменные из .env
load_dotenv()

# Берем URL из .env или используем значение по умолчанию
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://animal_user:animal_password@localhost:5432/animal_finder"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Функция для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Функция для создания таблиц
def create_tables(drop_first=False):
    from app.models.user import User
    from app.models.animal import Animal

    if drop_first:
        Base.metadata.drop_all(bind=engine)
        print("🗑️ Таблицы удалены!")
    Base.metadata.create_all(bind=engine)
    print("✅ Таблицы созданы!")