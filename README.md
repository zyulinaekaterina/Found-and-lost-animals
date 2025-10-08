# Animal Finder 🐾

Веб-приложение для поиска потерянных и найденных животных с использованием AI.

## 🚀 Технологии

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend  
- FastAPI (Python)
- SQLAlchemy
- ML модели для поиска по фото

## 📁 Структура проекта
Lost and found animals/

├── Lost and Found Animals Website/ # React приложение

├── animal_finder/ # FastAPI API

├── README.md

└── .gitignore

## 🛠️ Установка и запуск

### Frontend
```bash
cd Lost and Found Animals Website
npm install
npm run dev
```

### Backend
```bash
cd animal_finder  
pip install -r requirements.txt
uvicorn app.main:app --reload
```