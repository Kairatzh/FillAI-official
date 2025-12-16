"""Агент для детализации уроков"""
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from typing import Dict, Any
import json
import os


class LessonDetailAgent:
    """Агент, отвечающий за создание детального содержания уроков"""
    
    def __init__(self, model_name: str = None, temperature: float = 0.7):
        if model_name is None:
            model_name = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.llm = ChatOpenAI(model=model_name, temperature=temperature)
        self.prompt_template = ChatPromptTemplate.from_template(
            """Ты - опытный преподаватель. Создай ДЕТАЛЬНОЕ и ПОЛНОЕ содержание урока:

Название урока: {lesson_title}
Модуль: {module_title}
Курс: {course_title}
Уровень сложности: {difficulty}
Целевая аудитория: {target_audience}
Краткое описание: {lesson_summary}

ВАЖНО: Создай ПОЛНОЕ учебное содержание урока, включающее:
1. Введение в тему урока (1-2 абзаца)
2. Основные концепции и теория (3-4 абзаца с детальными объяснениями)
3. Примеры и практические применения (2-3 абзаца)
4. Ключевые выводы (1 абзац)
5. Практические упражнения (3-5 упражнений с подробными описаниями)

Содержание должно быть достаточно подробным, чтобы студент мог изучить тему самостоятельно.

Верни ТОЛЬКО валидный JSON без дополнительных комментариев:
{{
    "content": "ДЕТАЛЬНОЕ содержание урока минимум 5-7 абзацев с полным объяснением темы...",
    "exercises": [
        "Упражнение 1: краткое описание",
        "Упражнение 2: краткое описание",
        "Упражнение 3: краткое описание"
    ],
    "practice_exercises": [
        {{
            "title": "Название практического задания",
            "description": "Подробное описание задания с пошаговыми инструкциями",
            "difficulty": "easy|medium|hard",
            "estimated_time": "30 минут",
            "solution_hint": "Подсказка для решения (не полное решение)"
        }}
    ]
}}"""
        )
    
    async def generate_lesson_details(
        self, 
        lesson_title: str,
        module_title: str,
        course_title: str,
        difficulty: str,
        target_audience: str,
        lesson_summary: str
    ) -> Dict[str, Any]:
        """Генерирует детальное содержание урока"""
        chain = self.prompt_template | self.llm
        
        response = await chain.ainvoke({
            "lesson_title": lesson_title,
            "module_title": module_title,
            "course_title": course_title,
            "difficulty": difficulty,
            "target_audience": target_audience,
            "lesson_summary": lesson_summary
        })
        
        content = response.content.strip()
        
        # Убираем markdown код блоки если есть
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        try:
            details = json.loads(content)
            return details
        except json.JSONDecodeError as e:
            print(f"Ошибка парсинга JSON урока: {e}")
            return {
                "content": f"Содержание урока '{lesson_title}'. {lesson_summary}",
                "exercises": [
                    f"Практическое упражнение 1 по теме '{lesson_title}'",
                    f"Практическое упражнение 2 по теме '{lesson_title}'",
                    f"Практическое упражнение 3 по теме '{lesson_title}'"
                ]
            }

