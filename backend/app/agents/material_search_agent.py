"""Агент для поиска дополнительных материалов (видео, статьи и т.д.)"""
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from typing import List, Dict, Any
import os
try:
    from youtubesearchpython import VideosSearch
except ImportError:
    # Fallback если библиотека не установлена
    VideosSearch = None
import json

def normalize_text(value):
    if value is None:
        return None

    if isinstance(value, str):
        return value

    if isinstance(value, list):
        return " ".join(
            item.get("text", "")
            for item in value
            if isinstance(item, dict)
        )

    return str(value)


class MaterialSearchAgent:
    """Агент для поиска релевантных материалов для уроков"""
    
    def __init__(self, model_name: str = None, temperature: float = 0.7):
        if model_name is None:
            model_name = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.llm = ChatOpenAI(model=model_name, temperature=temperature)
        self.search_prompt_template = ChatPromptTemplate.from_template(
            """Ты - эксперт по поиску образовательных материалов. 

Для урока по теме "{lesson_title}" в курсе "{course_title}" (уровень: {difficulty}, аудитория: {target_audience}) создай оптимальные поисковые запросы для YouTube и других источников.

Создай 2-3 поисковых запроса для YouTube видео, которые будут максимально релевантны теме урока.

Верни ТОЛЬКО валидный JSON:
{{
    "youtube_queries": [
        "поисковый запрос 1",
        "поисковый запрос 2",
        "поисковый запрос 3"
    ],
    "material_suggestions": [
        {{
            "title": "Название материала",
            "type": "article|book|website",
            "description": "Описание почему этот материал полезен"
        }}
    ]
}}"""
        )
    
    async def generate_search_queries(
        self,
        lesson_title: str,
        course_title: str,
        difficulty: str,
        target_audience: str,
        lesson_summary: str
    ) -> Dict[str, Any]:
        """Генерирует поисковые запросы для материалов"""
        chain = self.search_prompt_template | self.llm
        
        response = await chain.ainvoke({
            "lesson_title": lesson_title,
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
            queries = json.loads(content)
            return queries
        except json.JSONDecodeError as e:
            print(f"Ошибка парсинга JSON поисковых запросов: {e}")
            # Возвращаем базовые запросы
            return {
                "youtube_queries": [
                    f"{lesson_title} {course_title}",
                    f"{lesson_title} tutorial",
                    f"{lesson_title} объяснение"
                ],
                "material_suggestions": []
            }
    
    def search_youtube_videos(self, query: str, max_results: int = 3) -> List[Dict[str, Any]]:
        """Ищет видео на YouTube"""
        if VideosSearch is None:
            print("youtube-search-python не установлен, пропускаем поиск видео")
            return []
        
        try:
            videos_search = VideosSearch(query, limit=max_results)
            results = videos_search.result()
            
            videos = []
            for video in results.get("result", []):
                videos.append({
                    "title": normalize_text(video.get("title")),
                    "url": video.get("link", ""),
                    "description": normalize_text(video.get("descriptionSnippet")),
                    "duration": normalize_text(video.get("duration")),
                    "channel": normalize_text(video.get("channel", {}).get("name") if video.get("channel") else None)
                })
            
            return videos
        except Exception as e:
            print(f"Ошибка поиска YouTube видео: {e}")
            return []
    
    async def find_materials_for_lesson(
        self,
        lesson_title: str,
        course_title: str,
        difficulty: str,
        target_audience: str,
        lesson_summary: str
    ) -> Dict[str, Any]:
        """Находит материалы для урока"""
        # Генерируем поисковые запросы
        queries_data = await self.generate_search_queries(
            lesson_title, course_title, difficulty, target_audience, lesson_summary
        )
        
        # Ищем видео на YouTube
        all_videos = []
        for query in queries_data.get("youtube_queries", [])[:2]:  # Берем первые 2 запроса
            videos = self.search_youtube_videos(query, max_results=2)
            all_videos.extend(videos)
        
        # Убираем дубликаты по URL
        seen_urls = set()
        unique_videos = []
        for video in all_videos:
            if video.get("url") and video["url"] not in seen_urls:
                seen_urls.add(video["url"])
                unique_videos.append(video)
        
        # Ограничиваем до 3 лучших видео
        unique_videos = unique_videos[:3]
        
        return {
            "videos": unique_videos,
            "additional_materials": queries_data.get("material_suggestions", [])
        }

