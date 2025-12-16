"""FastAPI приложение для генерации курсов"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import (
    CourseGenerationRequest,
    CourseGenerationResponse,
    CourseSettings
)
from app.agents.course_coordinator import CourseCoordinator
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

app = FastAPI(
    title="Course Generation API",
    description="API для генерации образовательных курсов с использованием AI",
    version="1.0.0"
)

# Настройка CORS для работы с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализируем координатор курсов
coordinator = CourseCoordinator()


@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "message": "Course Generation API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Проверка здоровья сервиса"""
    return {
        "status": "healthy",
        "service": "course-generation-api"
    }


@app.post("/api/courses/generate", response_model=CourseGenerationResponse)
async def generate_course(request: CourseGenerationRequest):
    """
    Генерирует курс на основе настроек от фронтенда
    
    Использует мультиагентную систему:
    1. CourseStructureAgent - создает структуру курса (модули и уроки)
    2. LessonDetailAgent - детализирует содержание каждого урока
    """
    try:
        # Проверяем наличие API ключа OpenAI
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return CourseGenerationResponse(
                success=False,
                error="OPENAI_API_KEY не установлен в переменных окружения"
            )
        
        # Проверяем модель
        model_name = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        print(f"Используется модель: {model_name}")
        
        # Генерируем курс используя мультиагентную систему
        course = await coordinator.generate_course(request.settings)
        
        return CourseGenerationResponse(
            success=True,
            course=course,
            message="Курс успешно сгенерирован"
        )
    
    except Exception as e:
        error_msg = str(e)
        print(f"Ошибка при генерации курса: {error_msg}")
        
        # Более детальная обработка ошибок
        if "model" in error_msg.lower() and ("not found" in error_msg.lower() or "does not exist" in error_msg.lower()):
            current_model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
            error_msg = f"Модель '{current_model}' недоступна. Проверьте OPENAI_MODEL в .env файле. Попробуйте: gpt-3.5-turbo, gpt-4o, gpt-4o-mini"
        elif "api key" in error_msg.lower() or "authentication" in error_msg.lower():
            error_msg = "Неверный API ключ OpenAI. Проверьте OPENAI_API_KEY в .env файле."
        
        return CourseGenerationResponse(
            success=False,
            error=f"Ошибка при генерации курса: {error_msg}"
        )


@app.post("/api/courses/generate/batch")
async def generate_courses_batch(requests: list[CourseGenerationRequest]):
    """
    Генерирует несколько курсов параллельно
    """
    try:
        import asyncio
        
        tasks = [
            coordinator.generate_course(req.settings)
            for req in requests
        ]
        
        courses = await asyncio.gather(*tasks)
        
        return {
            "success": True,
            "courses": [course.model_dump() for course in courses],
            "count": len(courses)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при пакетной генерации: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

