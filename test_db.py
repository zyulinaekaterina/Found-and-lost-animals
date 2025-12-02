# test_db.py
import os

# Удаляем старую базу если есть
if os.path.exists("animal_finder.db"):
    os.remove("animal_finder.db")
    print("🗑️ Удалили старую базу данных")

from app.core.database import create_tables

print("🚀 Создаем таблицы...")
create_tables()

# Проверяем результат
if os.path.exists("animal_finder.db"):
    size = os.path.getsize("animal_finder.db")
    print(f"✅ Файл базы создан! Размер: {size} байт")

    # Простая проверка через SQLite
    import sqlite3

    conn = sqlite3.connect('animal_finder.db')
    cursor = conn.cursor()

    # Получаем список таблиц
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"📋 Таблицы в базе: {[table[0] for table in tables]}")

    # Проверяем структуру таблицы animals
    cursor.execute("PRAGMA table_info(animals);")
    columns = cursor.fetchall()
    print(f"🔍 Колонки в таблице animals: {len(columns)}")

    conn.close()
else:
    print("❌ Файл базы не создан!")