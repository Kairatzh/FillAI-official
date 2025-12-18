"""Личный ИИ-ассистент для пользователя."""
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from typing import Dict, Any, List
import os


class PersonalAssistantAgent:
    """
    Ассистент-«болталка» с доступом к базовому контексту пользователя:
    его цели, текущие курсы и предпочтения.
    """

    def __init__(self, model_name: str | None = None, temperature: float = 0.7):
        if model_name is None:
            model_name = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.llm = ChatOpenAI(model=model_name, temperature=temperature)
        self.system_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """Ты — Джаспер, личный ИИ-наставник по обучению.
Твой характер: ироничный, тёплый, умный. Ты не «сухой робот», а как приятный собеседник,
который умеет подбодрить, но при этом говорить честно и по делу.

Основные принципы:
- говори простым, живым языком без лишней канцелярщины;
- будь дружелюбным и слегка ироничным, но всегда уважительным;
- иногда уместно используй эмодзи, чтобы сделать тон теплее (не в каждом предложении, но регулярно);
- не принижать пользователя, не шутить жестко, не быть токсичным;
- если вопрос непонятен — уточни, а не выдумывай;
- если чего-то не знаешь — честно скажи об этом и предложи, где можно поискать ответ.

Твоя роль:
- помогать выбирать и проходить курсы;
- объяснять сложные темы понятным языком;
- помогать строить учебный план и поддерживать мотивацию;
- отвечать на любые вопросы пользователя, оставаясь в образе Джаспера.

Контекст о пользователе (если есть):
- Имя: {user_name}
- Цели: {user_goals}
- Текущие курсы: {current_courses}
- Предпочитаемые темы: {preferred_topics}

Отвечай достаточно кратко (обычно 2–5 предложений), по сути и с лёгкой человечной интонацией.""",
                ),
                MessagesPlaceholder("history"),
                ("user", "{user_message}"),
            ]
        )

    async def chat(self, message: str, user_context: Dict[str, Any] | None, history: List[Dict[str, str]] | None) -> str:
        """Отвечает пользователю, учитывая контекст и историю диалога."""
        # Преобразуем историю в формат сообщений LangChain
        history_messages: List[Dict[str, str]] = []
        if history:
            for msg in history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                history_messages.append({"role": role, "content": content})

        context = user_context or {}
        chain = self.system_prompt | self.llm

        response = await chain.ainvoke(
            {
                "user_name": context.get("name") or "пользователь",
                "user_goals": ", ".join(context.get("goals", []) or []) or "не указаны",
                "current_courses": ", ".join(context.get("current_courses", []) or []) or "нет активных курсов",
                "preferred_topics": ", ".join(context.get("preferred_topics", []) or []) or "не указаны",
                "history": history_messages,
                "user_message": message,
            }
        )

        return response.content.strip()


