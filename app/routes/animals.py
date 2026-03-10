from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, text
from typing import Optional, List
from datetime import datetime
from sqlalchemy.sql import func
from sqlalchemy import func, cast
from pgvector.sqlalchemy import Vector

from fastapi import File, UploadFile, Form
from typing import Annotated
from PIL import Image
from io import BytesIO
from pydantic.networks import EmailStr

from fastapi.responses import FileResponse, JSONResponse
import os

from app.core.database import get_db
from app.models.animal import Animal
from app.models.user import User
from app.schemas.animal import AnimalCreate, AnimalResponse, AnimalSearch, AnimalListResponse, AnimalUpdate
from app.core.security import get_animal_if_owner_or_admin, get_current_user_from_bearer

from app.core.embedding import get_embedding_from_pil

IMAGE_DIR = "uploaded_images"
if not os.path.exists(IMAGE_DIR):
    os.makedirs(IMAGE_DIR)

router = APIRouter()


@router.get("/", response_model=AnimalListResponse)
async def get_animals(
        skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
        limit: int = Query(100, ge=1, le=1000, description="Лимит записей"),
        search: Optional[str] = Query(None, description="Поиск по имени, описанию или локации"),
        status: Optional[str] = Query(None, description="Фильтр по статусу: lost или found"),
        type: Optional[str] = Query(None, description="Фильтр по типу: dog, cat или other"),
        location: Optional[str] = Query(None, description="Фильтр по локации"),
        db: Session = Depends(get_db)
):
    """Получить список животных с пагинацией и фильтрацией"""

    # Базовый запрос
    query = db.query(Animal).filter(Animal.is_active == True)

    # Применяем фильтры
    if search:
        search_filter = or_(
            Animal.name.ilike(f"%{search}%"),
            Animal.description.ilike(f"%{search}%"),
            Animal.location.ilike(f"%{search}%"),
            Animal.breed.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    if status:
        query = query.filter(Animal.status == status)

    if type:
        query = query.filter(Animal.type == type)

    if location:
        query = query.filter(Animal.location.ilike(f"%{location}%"))

    # Получаем общее количество для пагинации
    total = query.count()

    # Применяем пагинацию
    animals = query.offset(skip).limit(limit).all()

    return AnimalListResponse(
        animals=animals,
        total=total,
        page=(skip // limit) + 1 if limit > 0 else 1,
        size=len(animals)
    )


# Функция для сохранения файла на диске
async def save_upload_file_locally(file: UploadFile, animal_id: int):
    # Определяем расширение и путь
    extension = file.filename.split('.')[-1].lower() if file.filename else 'jpeg'
    file_path = os.path.join(IMAGE_DIR, f"animal_{animal_id}.{extension}")

    # Сохраняем содержимое файла
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    return file_path, extension


@router.post("/", response_model=AnimalResponse, status_code=201)
async def create_animal(
        name: Annotated[str, Form()],
        type: Annotated[str, Form()],
        status: Annotated[str, Form()],
        color: Annotated[str, Form()],
        size: Annotated[str, Form()],
        location: Annotated[str, Form()],
        contact_name: Annotated[str, Form()],
        contact_email: Annotated[EmailStr, Form()],
        breed: Annotated[Optional[str], Form()] = None,
        description: Annotated[Optional[str], Form()] = None,
        contact_phone: Annotated[Optional[str], Form()] = None,
        file: UploadFile = File(...),  # файл обязателен
        current_user: User = Depends(get_current_user_from_bearer),
        db: Session = Depends(get_db),
):
    # Проверяем тип файла
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Можно загружать только изображения")

    # Читаем содержимое файла ОДИН раз
    contents = await file.read()

    # 1. Получаем embedding
    embedding = None
    try:
        image = Image.open(BytesIO(contents)).convert("RGB")
        embedding = get_embedding_from_pil(image)
    except Exception as e:
        print(f"⚠️ Embedding error: {e}")

    # 2. Сохраняем Animal в БД, чтобы получить db_animal.id
    db_animal = Animal(
        name=name,
        type=type,
        status=status,
        breed=breed,
        color=color,
        size=size,
        location=location,
        description=description,
        contact_name=contact_name,
        contact_phone=contact_phone,
        contact_email=contact_email,
        owner_id=current_user.id,
        embedding=embedding,
        image_url=None  # Изначально NULL, обновим после сохранения файла
    )
    db.add(db_animal)
    db.commit()
    db.refresh(db_animal)

    # 3. Сохраняем файл на диске, используя ID из БД
    try:
        extension = file.filename.split('.')[-1].lower() if file.filename and '.' in file.filename else 'jpeg'
        if extension == 'jpg': extension = 'jpeg'
        if extension not in ['jpeg', 'png']: extension = 'jpeg'

        file_name = f"animal_{db_animal.id}.{extension}"
        file_path = os.path.join(IMAGE_DIR, file_name)

        # Записываем содержимое файла на диск
        with open(file_path, "wb") as f:
            f.write(contents)

        # Обновляем image_url в БД, чтобы хранить имя файла
        db_animal.image_url = file_name
        db.commit()

    except Exception as e:
        print(f"⚠️ File save error for animal {db_animal.id}: {e}")

    # Конвертируем embedding в список
    if db_animal.embedding is not None:
        if hasattr(db_animal.embedding, 'tolist'):
            db_animal.embedding = db_animal.embedding.tolist()
        elif isinstance(db_animal.embedding, str):
            db_animal.embedding = [float(x) for x in db_animal.embedding.strip('{}').split(',')]

    return db_animal


@router.get("/me", response_model=AnimalListResponse)
async def get_my_animals(
    current_user: User = Depends(get_current_user_from_bearer),
    db: Session = Depends(get_db)
):
    """Получить список животных, созданных текущим пользователем"""
    query = db.query(Animal).filter(
        Animal.owner_id == current_user.id,
        Animal.is_active == True
    )

    total = query.count()
    animals = query.all()

    return AnimalListResponse(
        animals=animals,
        total=total,
        page=1,
        size=len(animals)
    )



@router.get("/{animal_id}", response_model=AnimalResponse)
async def get_animal(animal_id: int, db: Session = Depends(get_db)):
    """Получить животное по ID"""

    animal = db.query(Animal).filter(Animal.id == animal_id, Animal.is_active == True).first()

    if not animal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Животное не найдено"
        )

    return animal


@router.put("/{animal_id}", response_model=AnimalResponse)
async def update_animal(
    animal_id: int,
    animal_update: AnimalUpdate,
    animal: Animal = Depends(get_animal_if_owner_or_admin),  # автоматическая проверка прав
    db: Session = Depends(get_db)
):
    """Обновить информацию о животном (только владелец или суперпользователь)"""

    # Обновляем только переданные поля
    update_data = animal_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(animal, field, value)

    animal.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(animal)
    return animal


@router.delete("/{animal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_animal(
    animal_id: int,
    animal: Animal = Depends(get_animal_if_owner_or_admin),  # ← проверка прав
    db: Session = Depends(get_db)
):
    """Удалить животное (только владелец или суперпользователь)"""

    # Мягкое удаление: не удаляем из БД, а помечаем как неактивное
    animal.is_active = False
    animal.updated_at = datetime.utcnow()

    db.commit()
    return


@router.post("/search", response_model=AnimalListResponse)
async def search_animals(
        search: AnimalSearch,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """Поиск животных по критериям"""

    query = db.query(Animal).filter(Animal.is_active == True)

    # Применяем критерии поиска
    if search.search_term:
        search_filter = or_(
            Animal.name.ilike(f"%{search.search_term}%"),
            Animal.description.ilike(f"%{search.search_term}%"),
            Animal.location.ilike(f"%{search.search_term}%"),
            Animal.breed.ilike(f"%{search.search_term}%"),
            Animal.color.ilike(f"%{search.search_term}%")
        )
        query = query.filter(search_filter)

    if search.status:
        query = query.filter(Animal.status == search.status)

    if search.type:
        query = query.filter(Animal.type == search.type)

    if search.location:
        query = query.filter(Animal.location.ilike(f"%{search.location}%"))

    # Получаем общее количество
    total = query.count()

    # Применяем пагинацию
    animals = query.offset(skip).limit(limit).all()

    return AnimalListResponse(
        animals=animals,
        total=total,
        page=(skip // limit) + 1 if limit > 0 else 1,
        size=len(animals)
    )


@router.post("/search_similar", response_model=AnimalListResponse)
async def search_similar_animals(
    file: UploadFile = File(...),
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user_from_bearer),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Только изображения")

    contents = await file.read()
    image = Image.open(BytesIO(contents)).convert("RGB")
    query_embedding = get_embedding_from_pil(image)

    # Преобразуем embedding в строку в формате '[x,y,z]'
    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

    # Правильный вызов bindparam
    animals = db.query(Animal).filter(
        Animal.is_active == True,
        Animal.embedding.isnot(None)
    ).order_by(
        text("embedding <=> :embedding").bindparams(embedding=embedding_str)
    ).limit(limit).all()

    return AnimalListResponse(
        animals=animals,
        total=len(animals),
        page=1,
        size=len(animals)
    )


@router.get("/image/{animal_id}")
async def get_animal_image(animal_id: int, db: Session = Depends(get_db)):
    """
    Возвращает изображение животного по его ID, хранящееся локально.
    """
    # 1. Проверяем, существует ли животное в базе данных (опционально, но лучше)
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Животное не найдено")

    # 2. Определяем путь к файлу
    # Предполагаем, что файл называется animal_{id}.jpg/png и хранится в IMAGE_DIR
    # Важно: нам нужно знать, какой формат (расширение) файла используется

    # Для простоты будем искать либо .jpeg, либо .png
    image_path_jpg = os.path.join(IMAGE_DIR, f"animal_{animal_id}.jpeg")
    image_path_png = os.path.join(IMAGE_DIR, f"animal_{animal_id}.png")

    if os.path.exists(image_path_jpg):
        return FileResponse(image_path_jpg, media_type="image/jpeg")
    elif os.path.exists(image_path_png):
        return FileResponse(image_path_png, media_type="image/png")
    else:
        # Если файл не найден, возвращаем 404
        # (или можно вернуть заглушку, но 404 более корректен)
        raise HTTPException(status_code=404, detail="Изображение для этого животного не найдено")