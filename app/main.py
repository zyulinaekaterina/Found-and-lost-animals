from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import animals

app = FastAPI(
    title="Animal Finder API",
    description="API для поиска потерянных и найденных животных с ML-поиском",
    version="1.0.0"
)

# Настройка CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роуты
app.include_router(animals.router, prefix="/api/animals", tags=["animals"])

@app.get("/")
async def root():
    return {"message": "Animal Finder API работает! 🐾"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "animal-finder-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)