from .animals import router as animals_router
from .auth import router as auth_router

__all__ = ["animals_router", "auth_router"]