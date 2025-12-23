"""FastAPI приложение для генерации курсов"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import (
    CourseGenerationRequest,
    CourseGenerationResponse,
    CourseSettings,
    ExerciseCheckRequest,
    ExerciseCheckResponse,
    ExerciseCheckResult,
    AssistantChatRequest,
    AssistantChatResponse,
    ModuleTestRequest,
    ModuleTestResponse,
    ModuleTest,
    TestQuestion,
    CourseStructureResponse,
)
from app.agents.course_coordinator import CourseCoordinator
from app.agents.grading_agent import ExerciseGradingAgent
from app.agents.assistant_agent import PersonalAssistantAgent
from app.agents.test_generator_agent import TestGeneratorAgent
from app.routers import auth
from app.database import engine, Base
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

app = FastAPI(
    title="Fill AI API",
    description="API для образовательной платформы Fill AI с использованием AI",
    version="1.0.0"
)

# Create database tables (only in development, use migrations in production)
# Base.metadata.create_all(bind=engine)

# Настройка CORS для работы с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализируем координатор курсов и дополнительные агенты
coordinator = CourseCoordinator()
grading_agent = ExerciseGradingAgent()
assistant_agent = PersonalAssistantAgent()
test_generator = TestGeneratorAgent()

# Include routers
app.include_router(auth.router)

# Include routers
app.include_router(auth.router)


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
        
        # Пробрасываем дополнительные файлы в настройки
        if request.reference_files and not request.settings.reference_files:
            request.settings.reference_files = request.reference_files

        # Генерируем курс используя мультиагентную систему
        course = await coordinator.generate_course(
            settings=request.settings,
            structure_override=request.structure_override,
        )
        
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


@app.post("/api/ai/grade-exercise", response_model=ExerciseCheckResponse)
async def grade_exercise(request: ExerciseCheckRequest):
    """
    Простой ИИ-проверяющий для практических заданий.

    Используется фронтендом, чтобы оценивать текстовые ответы студентов
    и возвращать понятный фидбек, оценку и рекомендации по улучшению.
    """
    try:
        result_data = await grading_agent.grade_exercise(request.model_dump())
        result = ExerciseCheckResult(**result_data)
        return ExerciseCheckResponse(success=True, result=result)
    except Exception as e:
        return ExerciseCheckResponse(success=False, error=str(e))


@app.post("/api/ai/assistant/chat", response_model=AssistantChatResponse)
async def assistant_chat(request: AssistantChatRequest):
    """
    Личный ИИ-ассистент / болталка с доступом к базовому контексту пользователя.

    Фронтенд может передать:
    - user_context (имя, цели, текущие курсы)
    - history (предыдущие сообщения диалога)
    """
    try:
        history = [
            {"role": msg.role, "content": msg.content}
            for msg in (request.history or [])
        ]
        user_context = request.user_context.model_dump() if request.user_context else None

        reply = await assistant_agent.chat(
            message=request.message,
            user_context=user_context,
            history=history,
        )
        return AssistantChatResponse(success=True, reply=reply)
    except Exception as e:
        return AssistantChatResponse(success=False, error=str(e))


@app.post("/api/courses/generate-module-test", response_model=ModuleTestResponse)
async def generate_module_test(request: ModuleTestRequest):
    """
    Генерирует тест для модуля курса (2-3 вопроса).
    
    Использует TestGeneratorAgent для создания тестов на основе:
    - Названия курса и модуля
    - Описания модуля
    - Списка уроков в модуле
    - Уровня сложности курса
    """
    try:
        # Проверяем наличие API ключа OpenAI
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return ModuleTestResponse(
                success=False,
                error="OPENAI_API_KEY не установлен в переменных окружения"
            )
        
        # Генерируем тест для модуля
        test_data = await test_generator.generate_module_tests(
            course_title=request.course_title,
            module_title=request.module_title,
            module_description=request.module_description,
            lessons=request.lessons,
            difficulty=request.course_difficulty
        )
        
        # Преобразуем в модель
        test_questions = [
            TestQuestion(
                question=t["question"],
                options=t["options"],
                correct=t["correct"],
                explanation=t["explanation"]
            )
            for t in test_data.get("tests", [])
        ]
        
        module_test = ModuleTest(tests=test_questions)
        
        return ModuleTestResponse(
            success=True,
            test=module_test,
        )
    
    except Exception as e:
        error_msg = str(e)
        print(f"Ошибка при генерации теста: {error_msg}")
        return ModuleTestResponse(
            success=False,
            error=f"Ошибка при генерации теста: {error_msg}"
        )


@app.post("/api/courses/structure/preview", response_model=CourseStructureResponse)
async def preview_course_structure(request: CourseGenerationRequest):
    """
    Генерирует предварительную структуру курса (модули и уроки) без детализации.
    Преподаватель может отредактировать её перед финальной генерацией.
    """
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return CourseStructureResponse(
                success=False,
                error="OPENAI_API_KEY не установлен в переменных окружения"
            )

        # Используем только шаг построения структуры
        # Пробрасываем дополнительные файлы в настройки
        if request.reference_files and not request.settings.reference_files:
            request.settings.reference_files = request.reference_files

        structure = await coordinator.structure_agent.generate_structure(
            request.settings.model_dump()
        )

        return CourseStructureResponse(
            success=True,
            structure=structure
        )
    except Exception as e:
        error_msg = str(e)
        print(f"Ошибка при генерации структуры курса: {error_msg}")
        return CourseStructureResponse(
            success=False,
            error=f"Ошибка при генерации структуры: {error_msg}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

