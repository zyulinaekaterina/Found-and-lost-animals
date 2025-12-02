import psycopg2
from app.core.database import SQLALCHEMY_DATABASE_URL

try:
    # Пытаемся подключиться к PostgreSQL
    conn = psycopg2.connect(SQLALCHEMY_DATABASE_URL)
    cursor = conn.cursor()

    # Проверяем существующие базы данных
    cursor.execute("SELECT datname FROM pg_database;")
    databases = cursor.fetchall()
    print("📊 Базы данных в PostgreSQL:")
    for db in databases:
        print(f"  - {db[0]}")

    # Проверяем таблицы в animal_finder
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    tables = cursor.fetchall()
    print(f"📋 Таблицы в animal_finder: {[table[0] for table in tables]}")

    conn.close()
    print("✅ PostgreSQL подключен успешно!")

except Exception as e:
    print(f"❌ Ошибка подключения к PostgreSQL: {e}")
    print("Возможно, PostgreSQL не установлен или не запущен")