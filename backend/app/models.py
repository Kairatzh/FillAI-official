from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class CourseDifficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ReferenceFile(BaseModel):
    """Файл/материал для генерации"""
    name: str
    content: str = Field(..., description="Текстовое содержимое файла или выдержка")
    size_kb: Optional[int] = Field(None, description="Размер файла (кб)")
    type: Optional[str] = Field(None, description="MIME тип, если известен")


class CourseSettings(BaseModel):
    """Настройки курса от фронтенда"""
    title: str = Field(..., description="Название курса")
    description: Optional[str] = Field(None, description="Описание курса")
    difficulty: CourseDifficulty = Field(CourseDifficulty.INTERMEDIATE, description="Уровень сложности")
    duration_hours: int = Field(10, description="Продолжительность курса в часах")
    target_audience: str = Field(..., description="Целевая аудитория")
    learning_objectives: List[str] = Field(default_factory=list, description="Цели обучения")
    custom_category_name: Optional[str] = Field(None, description="Пользовательское название категории")
    additional_requirements: Optional[str] = Field(None, description="Дополнительные требования")
    reference_files: Optional[List[ReferenceFile]] = Field(
        default=None, description="Дополнительные файлы/материалы для генерации"
    )


class VideoMaterial(BaseModel):
    """Видео материал"""
    title: str
    url: str
    description: Optional[str] = None
    duration: Optional[str] = None
    channel: Optional[str] = None


class AdditionalMaterial(BaseModel):
    """Дополнительный материал"""
    title: str
    type: str = Field(..., description="Тип материала: article, book, website, etc.")
    url: Optional[str] = None
    description: Optional[str] = None


class PracticeExercise(BaseModel):
    """Практическое упражнение"""
    title: str
    description: str
    difficulty: str = Field("medium", description="easy, medium, hard")
    estimated_time: Optional[str] = None
    solution_hint: Optional[str] = None


class TermExplanation(BaseModel):
    """Объяснение термина (wiki-style)"""
    term: str
    explanation: str


class Lesson(BaseModel):
    """Урок"""
    title: str
    content: str
    duration_minutes: int
    exercises: List[str] = Field(default_factory=list)
    practice_exercises: List[PracticeExercise] = Field(default_factory=list, description="Детальные практические упражнения")
    videos: List[VideoMaterial] = Field(default_factory=list, description="Рекомендуемые видео")
    additional_materials: List[AdditionalMaterial] = Field(default_factory=list, description="Дополнительные материалы")
    terms: List[TermExplanation] = Field(default_factory=list, description="Объяснение сложных терминов в уроке")


class Module(BaseModel):
    """Модуль курса"""
    title: str
    description: str
    lessons: List[Lesson] = Field(default_factory=list)
    duration_hours: float


class Course(BaseModel):
    """Полный курс"""
    id: str
    title: str
    description: str
    category: str
    difficulty: CourseDifficulty
    modules: List[Module] = Field(default_factory=list)
    total_duration_hours: float
    learning_objectives: List[str] = Field(default_factory=list)


class LessonPlan(BaseModel):
    """Черновик урока (до детализации)"""
    title: str
    content: Optional[str] = None
    duration_minutes: int = Field(30, description="Оценка длительности урока")


class ModulePlan(BaseModel):
    """Черновик модуля для предварительного просмотра"""
    title: str
    description: Optional[str] = None
    lessons: List[LessonPlan] = Field(default_factory=list)


class CourseStructurePlan(BaseModel):
    """Структура курса до финальной генерации"""
    modules: List[ModulePlan] = Field(default_factory=list)

    class Config:
        extra = "allow"  # позволяем лишние поля (например, id с фронта)


class CourseGenerationRequest(BaseModel):
    """Запрос на генерацию курса"""
    settings: CourseSettings
    structure_override: Optional[CourseStructurePlan] = Field(
        None,
        description="Опциональная предварительно отредактированная структура курса",
    )
    reference_files: Optional[List[ReferenceFile]] = Field(
        default=None, description="Дополнительные файлы для учета при генерации"
    )


class CourseGenerationResponse(BaseModel):
    """Ответ с сгенерированным курсом"""
    success: bool
    course: Optional[Course] = None
    error: Optional[str] = None
    message: Optional[str] = None


class ExerciseCheckRequest(BaseModel):
    """Запрос на проверку практического задания ИИ"""
    course_title: str
    lesson_title: str
    exercise_title: str
    exercise_description: Optional[str] = None
    user_answer: str
    language: Optional[str] = Field("ru", description="Язык ответа пользователя")


class ExerciseCheckResult(BaseModel):
    """Результат проверки практического задания"""
    score: int = Field(..., ge=0, le=100, description="Оценка в процентах")
    verdict: str = Field(..., description="Краткий вывод (зачтено / нужно доработать)")
    strengths: List[str] = Field(default_factory=list, description="Что сделано хорошо")
    improvements: List[str] = Field(default_factory=list, description="Что можно улучшить")
    ai_feedback: str = Field(..., description="Развёрнутый комментарий ИИ на человеческом языке")


class ExerciseCheckResponse(BaseModel):
    """Ответ сервиса проверки заданий"""
    success: bool
    result: Optional[ExerciseCheckResult] = None
    error: Optional[str] = None


class ChatMessage(BaseModel):
    """Сообщение в чате с ИИ-ассистентом"""
    role: str = Field(..., description="system | user | assistant")
    content: str


class UserContext(BaseModel):
    """Краткие данные о пользователе, которые можно передать ассистенту"""
    name: Optional[str] = None
    goals: Optional[List[str]] = None
    current_courses: Optional[List[str]] = None
    preferred_topics: Optional[List[str]] = None


class AssistantChatRequest(BaseModel):
    """Запрос к личному ИИ-ассистенту"""
    message: str
    user_context: Optional[UserContext] = None
    history: Optional[List[ChatMessage]] = None
    language: Optional[str] = Field("ru", description="Желаемый язык ответа")


class AssistantChatResponse(BaseModel):
    """Ответ ассистента в чате"""
    success: bool
    reply: Optional[str] = None
    error: Optional[str] = None


class TestQuestion(BaseModel):
    """Вопрос теста"""
    question: str
    options: List[str] = Field(..., description="Список вариантов ответа (4 варианта)")
    correct: int = Field(..., ge=0, le=3, description="Индекс правильного ответа (0-3)")
    explanation: str = Field(..., description="Объяснение правильного ответа")


class ModuleTest(BaseModel):
    """Тест для модуля"""
    tests: List[TestQuestion] = Field(..., description="Список вопросов теста (2-3 вопроса)")


class ModuleTestRequest(BaseModel):
    """Запрос на генерацию теста для модуля"""
    course_title: str
    course_difficulty: str
    module_title: str
    module_description: str
    lessons: List[Dict[str, Any]] = Field(..., description="Список уроков модуля")


class ModuleTestResponse(BaseModel):
    """Ответ с тестом для модуля"""
    success: bool
    test: Optional[ModuleTest] = None
    error: Optional[str] = None


class CourseStructureResponse(BaseModel):
    """Ответ с предварительной структурой курса"""
    success: bool
    structure: Optional[CourseStructurePlan] = None
    error: Optional[str] = None