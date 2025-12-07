from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from datetime import datetime
from sqlalchemy.orm import relationship
from app.core.database import Base
from pgvector.sqlalchemy import Vector


class Animal(Base):
    __tablename__ = "animals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)  # 'dog', 'cat', 'other'
    status = Column(String(10), nullable=False)  # 'lost', 'found'
    breed = Column(String(100), nullable=True)
    color = Column(String(50), nullable=False)
    size = Column(String(20), nullable=False)  # 'small', 'medium', 'large'
    location = Column(String(200), nullable=False)
    date_reported = Column(DateTime, default=datetime.utcnow)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)

    # ML поле
    embedding = Column(Vector(768), nullable=True)

    # Контактная информация
    contact_name = Column(String(100), nullable=False)
    contact_phone = Column(String(20), nullable=True)
    contact_email = Column(String(100), nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)

    owner = relationship("User", back_populates="animals_created")

    # Метаданные
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Animal(id={self.id}, name='{self.name}', type='{self.type}')>"