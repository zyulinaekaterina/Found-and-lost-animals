# init_db.py
from app.core.database import engine, Base
from app.models.animal import Animal

def init_database():
    print("🗃️ Создаем таблицы базы данных...")
    Base.metadata.create_all(bind=engine)
    print("✅ Таблицы успешно созданы!")

if __name__ == "__main__":
    init_database()