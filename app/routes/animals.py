from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.animal import Animal
from app.schemas.animal import AnimalCreate, AnimalResponse, AnimalSearch, AnimalListResponse

router = APIRouter()

# Временное хранилище (позже заменим на реальную БД)
animals_db = []


@router.get("/", response_model=AnimalListResponse)
async def get_animals(
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        db: Session = Depends(get_db)
):
    """Получить список животных с пагинацией и поиском"""
    # Пока возвращаем демо-данные
    demo_animals = [
        AnimalResponse(
            id=1,
            name="Макс",
            type="dog",
            status="lost",
            breed="Золотистый ретривер",
            color="Рыжий",
            size="large",
            location="Центральный парк, Москва",
            description="Дружелюбный золотистый ретривер",
            contact_name="Анна Иванова",
            contact_phone="+79991234567",
            contact_email="anna@example.com",
            date_reported="2025-01-15T10:00:00",
            created_at="2025-01-15T10:00:00",
            updated_at="2025-01-15T10:00:00"
        ),
        AnimalResponse(
            id=2,
            name="Луна",
            type="cat",
            status="found",
            breed="Полосатая",
            color="Рыжая",
            size="small",
            location="Арбат, Москва",
            description="Милая полосатая кошка",
            contact_name="Петр Сидоров",
            contact_phone="+79999876543",
            contact_email="petr@example.com",
            date_reported="2025-01-14T15:30:00",
            created_at="2025-01-14T15:30:00",
            updated_at="2025-01-14T15:30:00"
        )
    ]

    return AnimalListResponse(
        animals=demo_animals,
        total=len(demo_animals),
        page=1,
        size=len(demo_animals)
    )


@router.post("/", response_model=AnimalResponse)
async def create_animal(animal: AnimalCreate, db: Session = Depends(get_db)):
    """Создать новое объявление о животном"""
    # Пока просто возвращаем демо-ответ
    demo_response = AnimalResponse(
        id=len(animals_db) + 1,
        **animal.dict(),
        image_url=None,
        date_reported="2025-01-15T10:00:00",
        created_at="2025-01-15T10:00:00",
        updated_at="2025-01-15T10:00:00"
    )

    animals_db.append(demo_response)
    return demo_response


@router.get("/{animal_id}", response_model=AnimalResponse)
async def get_animal(animal_id: int, db: Session = Depends(get_db)):
    """Получить животное по ID"""
    if animal_id == 1:
        return AnimalResponse(
            id=1,
            name="Макс",
            type="dog",
            status="lost",
            breed="Золотистый ретривер",
            color="Рыжий",
            size="large",
            location="Центральный парк, Москва",
            description="Дружелюбный золотистый ретривер, любит играть в мяч",
            contact_name="Анна Иванова",
            contact_phone="+79991234567",
            contact_email="anna@example.com",
            date_reported="2025-01-15T10:00:00",
            created_at="2025-01-15T10:00:00",
            updated_at="2025-01-15T10:00:00"
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Животное не найдено"
    )


@router.post("/search", response_model=AnimalListResponse)
async def search_animals(search: AnimalSearch, db: Session = Depends(get_db)):
    """Поиск животных по критериям"""
    # Пока возвращаем демо-данные
    demo_animals = [
        AnimalResponse(
            id=1,
            name="Макс",
            type="dog",
            status="lost",
            breed="Золотистый ретривер",
            color="Рыжий",
            size="large",
            location="Центральный парк, Москва",
            description="Дружелюбный золотистый ретривер",
            contact_name="Анна Иванова",
            contact_phone="+79991234567",
            contact_email="anna@example.com",
            date_reported="2025-01-15T10:00:00",
            created_at="2025-01-15T10:00:00",
            updated_at="2025-01-15T10:00:00"
        )
    ]

    return AnimalListResponse(
        animals=demo_animals,
        total=len(demo_animals),
        page=1,
        size=len(demo_animals)
    )