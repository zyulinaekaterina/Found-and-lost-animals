from pydantic import BaseModel
from typing import Optional

class HealthResponse(BaseModel):
    status: str
    service: str
    version: Optional[str] = "1.0.0"

class MessageResponse(BaseModel):
    message: str
    status: str = "success"

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    status: str = "error"