"""Координатор мультиагентной системы для создания курсов"""
from typing import Dict, Any, List
from app.agents.course_agent import CourseStructureAgent
from app.agents.lesson_agent import LessonDetailAgent
from app.agents.material_search_agent import MaterialSearchAgent
from app.models import (
    CourseSettings, Course, Module, Lesson, CourseDifficulty,
    VideoMaterial, AdditionalMaterial, PracticeExercise
)
import asyncio


class CourseCoordinator:
    """Координирует работу агентов для создания полного курса"""
    
    def __init__(self):
        self.structure_agent = CourseStructureAgent()
        self.lesson_agent = LessonDetailAgent()
        self.material_agent = MaterialSearchAgent()
    
    async def generate_course(self, settings: CourseSettings) -> Course:
        """Генерирует полный курс используя мультиагентную систему"""
        
        # Шаг 1: Создаем структуру курса
        settings_dict = settings.model_dump()
        structure = await self.structure_agent.generate_structure(settings_dict)
        
        # Шаг 2: Детализируем каждый урок параллельно с поиском материалов
        modules = []
        total_duration = 0
        
        for module_data in structure.get("modules", []):
            module_title = module_data.get("title", "Модуль")
            module_description = module_data.get("description", "")
            lessons_data = module_data.get("lessons", [])
            
            # Создаем задачи для параллельной обработки уроков
            lesson_tasks = []
            material_tasks = []
            
            for lesson_data in lessons_data:
                lesson_title = lesson_data.get("title", "Урок")
                lesson_summary = lesson_data.get("content", "")
                
                # Задача для генерации детального содержания
                lesson_task = self.lesson_agent.generate_lesson_details(
                    lesson_title=lesson_title,
                    module_title=module_title,
                    course_title=settings.title,
                    difficulty=settings.difficulty.value,
                    target_audience=settings.target_audience,
                    lesson_summary=lesson_summary
                )
                
                # Задача для поиска материалов
                material_task = self.material_agent.find_materials_for_lesson(
                    lesson_title=lesson_title,
                    course_title=settings.title,
                    difficulty=settings.difficulty.value,
                    target_audience=settings.target_audience,
                    lesson_summary=lesson_summary
                )
                
                lesson_tasks.append((lesson_data, lesson_task))
                material_tasks.append(material_task)
            
            # Выполняем все задачи параллельно
            lessons = []
            module_duration = 0
            
            # Собираем все задачи для параллельного выполнения
            all_lesson_tasks = [task for _, task in lesson_tasks]
            all_material_tasks = material_tasks
            
            # Выполняем параллельно
            lesson_results = await asyncio.gather(*all_lesson_tasks)
            material_results = await asyncio.gather(*all_material_tasks)
            
            # Обрабатываем результаты
            for (lesson_data, _), lesson_details, materials_data in zip(lesson_tasks, lesson_results, material_results):
                # Преобразуем практические упражнения
                practice_exercises = []
                for pe_data in lesson_details.get("practice_exercises", []):
                    practice_exercises.append(
                        PracticeExercise(
                            title=pe_data.get("title", "Практическое задание"),
                            description=pe_data.get("description", ""),
                            difficulty=pe_data.get("difficulty", "medium"),
                            estimated_time=pe_data.get("estimated_time"),
                            solution_hint=pe_data.get("solution_hint")
                        )
                    )
                
                # Преобразуем видео
                videos = []
                for video_data in materials_data.get("videos", []):
                    videos.append(
                        VideoMaterial(
                            title=video_data.get("title", ""),
                            url=video_data.get("url", ""),
                            description=video_data.get("description"),
                            duration=video_data.get("duration"),
                            channel=video_data.get("channel")
                        )
                    )
                
                # Преобразуем дополнительные материалы
                additional_materials = []
                for mat_data in materials_data.get("additional_materials", []):
                    additional_materials.append(
                        AdditionalMaterial(
                            title=mat_data.get("title", ""),
                            type=mat_data.get("type", "article"),
                            url=mat_data.get("url"),
                            description=mat_data.get("description")
                        )
                    )
                
                lesson = Lesson(
                    title=lesson_data.get("title", "Урок"),
                    content=lesson_details.get("content", ""),
                    duration_minutes=lesson_data.get("duration_minutes", 30),
                    exercises=lesson_details.get("exercises", []),
                    practice_exercises=practice_exercises,
                    videos=videos,
                    additional_materials=additional_materials
                )
                lessons.append(lesson)
                module_duration += lesson.duration_minutes
            
            module = Module(
                title=module_title,
                description=module_description,
                lessons=lessons,
                duration_hours=round(module_duration / 60, 1)
            )
            modules.append(module)
            total_duration += module.duration_hours
        
        # Создаем финальный курс
        category = settings.custom_category_name or self._determine_category(settings.title)
        
        course = Course(
            id=self._generate_course_id(settings.title),
            title=settings.title,
            description=settings.description or f"Курс по теме '{settings.title}'",
            category=category,
            difficulty=settings.difficulty,
            modules=modules,
            total_duration_hours=round(total_duration, 1),
            learning_objectives=settings.learning_objectives or []
        )
        
        return course
    
    def _determine_category(self, title: str) -> str:
        """Определяет категорию курса на основе названия"""
        title_lower = title.lower()
        
        # Простая логика определения категории
        if any(word in title_lower for word in ["английский", "english", "язык", "language"]):
            return "Языки"
        elif any(word in title_lower for word in ["программирование", "coding", "python", "javascript"]):
            return "Программирование"
        elif any(word in title_lower for word in ["математика", "math", "физика", "physics"]):
            return "Наука"
        elif any(word in title_lower for word in ["дизайн", "design", "графика"]):
            return "Дизайн"
        else:
            return "Общее"
    
    def _generate_course_id(self, title: str) -> str:
        """Генерирует ID курса"""
        import hashlib
        import time
        
        # Используем хеш названия + timestamp для уникальности
        combined = f"{title}_{time.time()}"
        return hashlib.md5(combined.encode()).hexdigest()[:12]
