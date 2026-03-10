# create_superuser.py
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Добавьте путь к проекту
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base
from app.models.user import User
from app.core.security import get_password_hash

# Настройки БД (скопируйте из вашего config.py)
DATABASE_URL = "postgresql://animal_user:animal_password@localhost:5432/animal_finder"


def create_superuser(email: str, name: str, password: str):
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # Проверяем, существует ли пользователь
        user = db.query(User).filter(User.email == email).first()

        if user:
            # Если существует - делаем суперпользователем
            user.is_superuser = True
            print(f"Пользователь {email} теперь суперпользователь")
        else:
            # Если не существует - создаем нового
            hashed_password = get_password_hash(password)
            new_user = User(
                email=email,
                name=name,
                hashed_password=hashed_password,
                is_superuser=True,
                is_active=True
            )
            db.add(new_user)
            print(f"Создан новый суперпользователь: {email}")

        db.commit()
        print("✅ Готово!")

    except Exception as e:
        print(f"❌ Ошибка: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":

    email = "crot@ya.com"
    name = "Крот"
    password = '1488'
    create_superuser(email, name, password)