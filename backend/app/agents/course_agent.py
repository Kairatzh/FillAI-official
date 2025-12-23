"""Агент для создания структуры курса"""
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from typing import Dict, Any, List
import json
import os


class CourseStructureAgent:
    """Агент, отвечающий за создание структуры курса"""
    
    def __init__(self, model_name: str = None, temperature: float = 0.7):
        if model_name is None:
            model_name = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.llm = ChatOpenAI(model=model_name, temperature=temperature)
        self.prompt_template = ChatPromptTemplate.from_template(
            """Ты - эксперт по созданию образовательных курсов. 
Создай структуру курса на основе следующих параметров:

Название курса: {title}
Описание: {description}
Уровень сложности: {difficulty}
Продолжительность: {duration_hours} часов
Целевая аудитория: {target_audience}
Цели обучения: {learning_objectives}
Переданные материалы: {reference_files}

Создай детальную структуру курса, включающую:
1. Модули (обычно 3-6 модулей в зависимости от продолжительности)
2. Для каждого модуля: название, описание, список уроков
3. Для каждого урока: название, краткое содержание, продолжительность в минутах

Верни ТОЛЬКО валидный JSON без дополнительных комментариев:
{{
    "modules": [
        {{
            "title": "Название модуля",
            "description": "Описание модуля",
            "lessons": [
                {{
                    "title": "Название урока",
                    "content": "Краткое содержание урока (1-2 предложения)",
                    "duration_minutes": 30
                }}
            ]
        }}
    ]
}}"""
        )
    
    async def generate_structure(self, course_settings: Dict[str, Any]) -> Dict[str, Any]:
        """Генерирует структуру курса"""
        chain = self.prompt_template | self.llm
        
        learning_objectives_str = "\n".join(
            f"- {obj}" for obj in course_settings.get("learning_objectives", [])
        ) if course_settings.get("learning_objectives") else "Не указаны"

        reference_files = course_settings.get("reference_files") or []
        reference_summary = (
            "\n".join(
                f"- {item.get('name')}: {item.get('content', '')[:300]}"
                for item in reference_files
            )
            if reference_files else "Не переданы"
        )
        
        response = await chain.ainvoke({
            "title": course_settings.get("title", ""),
            "description": course_settings.get("description", ""),
            "difficulty": course_settings.get("difficulty", "intermediate"),
            "duration_hours": course_settings.get("duration_hours", 10),
            "target_audience": course_settings.get("target_audience", ""),
            "learning_objectives": learning_objectives_str,
            "reference_files": reference_summary,
        })
        
        # Парсим JSON из ответа
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
            structure = json.loads(content)
            return structure
        except json.JSONDecodeError as e:
            # Если не удалось распарсить, возвращаем базовую структуру
            print(f"Ошибка парсинга JSON: {e}")
            print(f"Содержимое ответа: {content}")
            return self._get_default_structure(course_settings)
    
    def _get_default_structure(self, course_settings: Dict[str, Any]) -> Dict[str, Any]:
        """Возвращает базовую структуру курса при ошибке"""
        duration = course_settings.get("duration_hours", 10)
        modules_count = max(3, min(6, duration // 2))
        
        return {
            "modules": [
                {
                    "title": f"Модуль {i+1}: Введение",
                    "description": "Вводный модуль курса",
                    "lessons": [
                        {
                            "title": f"Урок {j+1}",
                            "content": "Содержание урока",
                            "duration_minutes": 30
                        }
                        for j in range(2)
                    ]
                }
                for i in range(modules_count)
            ]
        }

