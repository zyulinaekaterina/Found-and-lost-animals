from pydantic import BaseModel
from pydantic.networks import EmailStr
from datetime import datetime
from typing import Optional, List


# Базовые схемы для API

class AnimalBase(BaseModel):
    name: str
    type: str  # 'dog', 'cat', 'other'
    status: str  # 'lost', 'found'
    breed: Optional[str] = None
    color: str
    size: str  # 'small', 'medium', 'large'
    location: str
    description: Optional[str] = None
    contact_name: str
    contact_phone: Optional[str] = None
    contact_email: EmailStr


# Для создания нового животного
class AnimalCreate(AnimalBase):
    pass


# Для обновления животного (все поля опциональны)
class AnimalUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    breed: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None


# Для ответа API (включает ID и даты)
class AnimalResponse(AnimalBase):
    id: int
    owner_id: int
    date_reported: datetime
    created_at: datetime
    updated_at: datetime
    embedding: Optional[list[float]] = None
    is_active: bool
    class Config:
        from_attributes = True  # Для совместимости с SQLAlchemy


# Для поиска животных
class AnimalSearch(BaseModel):
    search_term: Optional[str] = None
    status: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None


# Для ответа с списком животных
class AnimalListResponse(BaseModel):
    animals: List[AnimalResponse]
    total: int
    page: int
    size: int

    class Config:
        from_attributes = True