"""Агент для проверки практических заданий студентов."""
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from typing import Dict, Any
import json
import os


class ExerciseGradingAgent:
    """Простой ИИ-проверяющий решения практических заданий."""

    def __init__(self, model_name: str | None = None, temperature: float = 0.3):
        if model_name is None:
            model_name = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.llm = ChatOpenAI(model=model_name, temperature=temperature)
        self.prompt_template = ChatPromptTemplate.from_template(
            """Ты — строгий, но доброжелательный наставник по программированию/анализу данных.

Проверь решение студента для практического задания и оцени его по следующим правилам:
- оцени понимание задачи;
- оцени корректность решения;
- дай честную, но мотивирующую обратную связь.

Информация о задании:
- Курс: {course_title}
- Урок: {lesson_title}
- Задание: {exercise_title}
- Описание задания: {exercise_description}

Ответ студента:
\"\"\"{user_answer}\"\"\"

ВЕРНИ ТОЛЬКО ВАЛИДНЫЙ JSON БЕЗ дополнительных комментариев:
{{
  "score": 0-100,                // целое число, процент правильности
  "verdict": "краткий вывод",    // например: "зачтено" или "нужно доработать"
  "strengths": [
    "что сделано хорошо"
  ],
  "improvements": [
    "что можно улучшить"
  ],
  "ai_feedback": "развёрнутый комментарий на человеческом языке"
}}"""
        )

    async def grade_exercise(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Проверяет задание и возвращает структурированный результат."""
        chain = self.prompt_template | self.llm

        response = await chain.ainvoke(
            {
                "course_title": payload.get("course_title", ""),
                "lesson_title": payload.get("lesson_title", ""),
                "exercise_title": payload.get("exercise_title", ""),
                "exercise_description": payload.get("exercise_description", "") or "",
                "user_answer": payload.get("user_answer", ""),
            }
        )

        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            # fallback, если LLM вернул что-то невалидное
            return {
                "score": 50,
                "verdict": "нужно доработать",
                "strengths": [],
                "improvements": [],
                "ai_feedback": "Не удалось корректно распознать ответ, но, похоже, вы в правильном направлении. Попробуйте переформулировать решение и отправить ещё раз."
            }

        # Минимальная валидация
        data.setdefault("score", 0)
        data.setdefault("verdict", "нужно доработать")
        data.setdefault("strengths", [])
        data.setdefault("improvements", [])
        data.setdefault("ai_feedback", "")
        return data


