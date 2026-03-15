from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, text
from typing import Optional
from datetime import datetime

from fastapi import File, UploadFile, Form
from typing import Annotated
from PIL import Image
from io import BytesIO
from pydantic.networks import EmailStr

from fastapi.responses import RedirectResponse

import os

from app.core.database import get_db
from app.models.animal import Animal
from app.models.user import User
from app.schemas.animal import AnimalResponse, AnimalSearch, AnimalListResponse, AnimalUpdate
from app.core.security import get_animal_if_owner_or_admin, get_current_user_from_bearer
from app.core.embedding import get_embedding_from_pil
from app.core.minio_service import minio_service

router = APIRouter()


@router.get("/", response_model=AnimalListResponse)
async def get_animals(
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=1000),
        search: Optional[str] = Query(None),
        status: Optional[str] = Query(None),
        type: Optional[str] = Query(None),
        location: Optional[str] = Query(None),
        sort_order: Optional[str] = Query("desc", description="Направление сортировки по дате: asc или desc"),
        db: Session = Depends(get_db)
):
    """Получить список животных с пагинацией, фильтрацией и сортировкой по дате"""
    query = db.query(Animal).filter(Animal.is_active == True)

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

    # Сортировка по дате создания
    if sort_order == "desc":
        query = query.order_by(Animal.created_at.desc())  # Сначала новые
    else:
        query = query.order_by(Animal.created_at.asc())   # Сначала старые

    total = query.count()
    animals = query.offset(skip).limit(limit).all()

    return AnimalListResponse(
        animals=animals,
        total=total,
        page=(skip // limit) + 1 if limit > 0 else 1,
        size=len(animals)
    )


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
        file: UploadFile = File(...),
        current_user: User = Depends(get_current_user_from_bearer),
        db: Session = Depends(get_db),
):
    # Проверяем тип файла
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Можно загружать только изображения")

    contents = await file.read()

    # Получаем embedding
    embedding = None
    try:
        image = Image.open(BytesIO(contents)).convert("RGB")
        embedding = get_embedding_from_pil(image)
    except Exception as e:
        print(f"⚠️ Embedding error: {e}")

    # Сохраняем животное в БД без image_url
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
        image_url=None
    )
    db.add(db_animal)
    db.commit()
    db.refresh(db_animal)

    # Сохраняем файл в MinIO
    try:
        # Определяем расширение
        extension = file.filename.split('.')[-1].lower() if file.filename and '.' in file.filename else 'jpeg'
        if extension == 'jpg': extension = 'jpeg'
        if extension not in ['jpeg', 'png']: extension = 'jpeg'

        object_name = f"animal_{db_animal.id}.{extension}"
        # Загружаем в MinIO
        minio_service.upload_file(contents, object_name, file.content_type)

        # Обновляем image_url в БД
        db_animal.image_url = object_name
        db.commit()

    except Exception as e:
        print(f"⚠️ MinIO upload error for animal {db_animal.id}: {e}")

    # Конвертируем embedding в список для ответа (если нужно)
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
    animal = db.query(Animal).filter(Animal.id == animal_id, Animal.is_active == True).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Животное не найдено")
    return animal


@router.put("/{animal_id}", response_model=AnimalResponse)
async def update_animal(
    animal_id: int,
    animal_update: AnimalUpdate,
    animal: Animal = Depends(get_animal_if_owner_or_admin),
    db: Session = Depends(get_db)
):
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
    animal: Animal = Depends(get_animal_if_owner_or_admin),
    db: Session = Depends(get_db)
):
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
    query = db.query(Animal).filter(Animal.is_active == True)
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
    total = query.count()
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

    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"
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
    Возвращает редирект на presigned URL изображения из MinIO.
    """
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Животное не найдено")

    if not animal.image_url:
        raise HTTPException(status_code=404, detail="Изображение отсутствует")

    # Генерируем presigned URL (действителен 1 час)
    try:
        presigned_url = minio_service.get_presigned_url(animal.image_url, expires_in=3600)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при получении изображения: {str(e)}")

    # Редирект на presigned URL
    return RedirectResponse(url=presigned_url)