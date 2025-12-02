from app.core.database import create_tables, SessionLocal
from app.models.animal import Animal


def test_postgres():
    print("🧪 Тестируем PostgreSQL подключение...")

    # Создаем таблицы
    create_tables()

    # Тестируем запись
    db = SessionLocal()
    try:
        test_animal = Animal(
            name="Тестовый в PostgreSQL",
            type="dog",
            status="found",
            color="black",
            size="medium",
            location="Test Location",
            contact_name="Test",
            contact_email="test@example.com"
        )
        db.add(test_animal)
        db.commit()
        print("✅ Запись в PostgreSQL работает!")

        # Тестируем чтение
        animals = db.query(Animal).all()
        print(f"✅ Чтение из PostgreSQL работает! Найдено животных: {len(animals)}")

    finally:
        db.close()


if __name__ == "__main__":
    test_postgres()