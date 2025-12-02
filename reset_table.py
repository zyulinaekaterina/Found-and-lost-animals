import os
from app.core.database import create_tables

print("🗑️ Удаляем таблицы...")
create_tables(drop_first=True)  # Мы добавим опцию drop_first в функцию create_tables
print("✅ Таблицы пересозданы с обновлённой структурой!")