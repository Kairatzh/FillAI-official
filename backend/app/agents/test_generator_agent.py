"""Агент для генерации тестов по модулям"""
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from typing import Dict, Any, List
import json
import os


class TestGeneratorAgent:
    """Агент, отвечающий за создание тестов для модулей курса"""
    
    def __init__(self, model_name: str = None, temperature: float = 0.7):
        if model_name is None:
            model_name = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.llm = ChatOpenAI(model=model_name, temperature=temperature)
        self.prompt_template = ChatPromptTemplate.from_template(
            """Ты - опытный преподаватель, создающий тесты для проверки знаний студентов.

Курс: {course_title}
Модуль: {module_title}
Описание модуля: {module_description}
Уровень сложности: {difficulty}

Список уроков в модуле:
{lessons_list}

Создай 2-3 теста для проверки знаний по этому модулю. Каждый тест должен:
1. Проверять понимание ключевых концепций модуля
2. Иметь 4 варианта ответа (только один правильный)
3. Включать объяснение правильного ответа
4. Быть разного уровня сложности (легкий, средний, сложный)

Верни ТОЛЬКО валидный JSON без дополнительных комментариев:
{{
    "tests": [
        {{
            "question": "Вопрос для проверки знаний",
            "options": [
                "Вариант ответа 1",
                "Вариант ответа 2",
                "Вариант ответа 3",
                "Вариант ответа 4"
            ],
            "correct": 0,
            "explanation": "Подробное объяснение правильного ответа и почему другие варианты неверны"
        }}
    ]
}}"""
        )
    
    async def generate_module_tests(
        self,
        course_title: str,
        module_title: str,
        module_description: str,
        lessons: List[Dict[str, Any]],
        difficulty: str = "intermediate"
    ) -> Dict[str, Any]:
        """Генерирует тесты для модуля"""
        chain = self.prompt_template | self.llm
        
        # Формируем список уроков
        lessons_list = "\n".join([
            f"- {lesson.get('title', 'Урок')}: {lesson.get('content', '')[:100]}..."
            for lesson in lessons
        ])
        
        response = await chain.ainvoke({
            "course_title": course_title,
            "module_title": module_title,
            "module_description": module_description,
            "lessons_list": lessons_list,
            "difficulty": difficulty
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
            tests_data = json.loads(content)
            # Ограничиваем количество тестов до 3
            if "tests" in tests_data and len(tests_data["tests"]) > 3:
                tests_data["tests"] = tests_data["tests"][:3]
            return tests_data
        except json.JSONDecodeError as e:
            print(f"Ошибка парсинга JSON тестов: {e}")
            print(f"Содержимое ответа: {content}")
            # Возвращаем базовые тесты
            return {
                "tests": [
                    {
                        "question": f"Что является основной темой модуля '{module_title}'?",
                        "options": [
                            "Основные концепции модуля",
                            "Продвинутые техники",
                            "Исторический контекст",
                            "Практические примеры"
                        ],
                        "correct": 0,
                        "explanation": "Этот модуль фокусируется на основных концепциях темы."
                    },
                    {
                        "question": "Какой из следующих подходов лучше всего подходит для изучения этого модуля?",
                        "options": [
                            "Изучать последовательно все уроки",
                            "Пропустить введение",
                            "Читать только заголовки",
                            "Изучать в случайном порядке"
                        ],
                        "correct": 0,
                        "explanation": "Последовательное изучение всех уроков помогает лучше понять материал."
                    }
                ]
            }

