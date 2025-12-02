from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional, List
from datetime import datetime

from app.core.database import get_db
from app.models.animal import Animal
from app.models.user import User
from app.schemas.animal import AnimalCreate, AnimalResponse, AnimalSearch, AnimalListResponse, AnimalUpdate
from app.core.security import get_animal_if_owner_or_admin, get_current_user_from_bearer

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


@router.post("/", response_model=AnimalResponse, status_code=201)
async def create_animal(
    animal: AnimalCreate,
    current_user: User = Depends(get_current_user_from_bearer),
    db: Session = Depends(get_db),
):
    db_animal = Animal(**animal.dict(), owner_id=current_user.id)
    db.add(db_animal)
    db.commit()
    db.refresh(db_animal)
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