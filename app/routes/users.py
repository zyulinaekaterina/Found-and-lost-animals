from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserListResponse  # Импортируем обе схемы
from app.core.security import get_current_user_from_bearer

router = APIRouter(prefix="/users", tags=["users"])


# Проверка на суперпользователя
def require_superuser(current_user: User = Depends(get_current_user_from_bearer)):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Требуются права суперпользователя"
        )
    return current_user


@router.get("/", response_model=UserListResponse)  # Теперь используем правильную схему
async def get_users(
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=1000),
        search: Optional[str] = None,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_superuser)
):
    """Получить список всех пользователей (только для суперпользователя)"""

    query = db.query(User).filter(User.is_active == True)

    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )

    total = query.count()
    users = query.offset(skip).limit(limit).all()

    # Возвращаем в правильном формате: объект с полями users и total
    return UserListResponse(
        users=users,  # SQLAlchemy модели автоматически преобразуются в UserResponse благодаря from_attributes=True
        total=total
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_superuser)
):
    """Получить информацию о пользователе по ID (только для суперпользователя)"""

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return user


@router.post("/{user_id}/make-superuser", response_model=UserResponse)
async def make_superuser(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_superuser)
):
    """Сделать пользователя суперпользователем (только для суперпользователя)"""

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя изменить права самого себя")

    user.is_superuser = True
    db.commit()
    db.refresh(user)

    return user


@router.post("/{user_id}/remove-superuser", response_model=UserResponse)
async def remove_superuser(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_superuser)
):
    """Забрать права суперпользователя (только для суперпользователя)"""

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя изменить права самого себя")

    user.is_superuser = False
    db.commit()
    db.refresh(user)

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_superuser)
):
    """Мягкое удаление пользователя (только для суперпользователя)"""

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя удалить самого себя")

    user.is_active = False
    db.commit()

    return