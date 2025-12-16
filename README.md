# Living Graph UI - Образовательная платформа с AI

Полнофункциональная платформа для создания образовательных курсов с использованием искусственного интеллекта.

## Структура проекта

```
living-graph-ui/
├── frontend/          # Next.js фронтенд приложение
├── backend/           # FastAPI бэкенд с LangChain/LangGraph
└── project/           # Исходные версии проекта
```

## Быстрый старт

### 1. Запуск бэкенда

```bash
cd backend

# Создайте виртуальное окружение
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows

# Установите зависимости
pip install -r requirements.txt

# Создайте файл .env на основе env.example
cp env.example .env
# Отредактируйте .env и добавьте ваш OPENAI_API_KEY

# Запустите сервер
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Бэкенд будет доступен на `http://localhost:8000`
- API документация: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Запуск фронтенда

```bash
cd frontend

# Установите зависимости (если еще не установлены)
npm install

# Создайте файл .env.local (опционально)
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Запустите dev сервер
npm run dev
```

Фронтенд будет доступен на `http://localhost:3000`

## Функциональность

### Фронтенд
- **Интерактивный граф знаний** - визуализация курсов и категорий
- **Генерация курсов** - создание курсов через AI
- **Библиотека курсов** - просмотр и управление созданными курсами
- **Коммьюнити** - обсуждение и обмен курсами
- **Профиль** - настройки пользователя

### Бэкенд
- **FastAPI сервер** - RESTful API для генерации курсов
- **Мультиагентная система** - координация AI агентов для создания курсов
- **LangChain + LangGraph** - работа с LLM моделями
- **OpenAI GPT-4** - генерация контента курсов

## Архитектура

### Мультиагентная система бэкенда

1. **CourseStructureAgent** - создает структуру курса (модули и уроки)
2. **LessonDetailAgent** - детализирует содержание каждого урока
3. **CourseCoordinator** - координирует работу агентов

### Процесс генерации курса

1. Фронтенд отправляет запрос с настройками курса
2. Бэкенд получает запрос и передает его координатору
3. CourseStructureAgent создает структуру курса
4. LessonDetailAgent параллельно обрабатывает все уроки
5. CourseCoordinator собирает финальный курс
6. Курс возвращается на фронтенд и отображается в графе

## API Endpoints

### POST `/api/courses/generate`

Генерирует курс на основе настроек.

**Request:**
```json
{
  "settings": {
    "title": "Изучение Python",
    "description": "Курс для начинающих",
    "difficulty": "beginner",
    "duration_hours": 20,
    "target_audience": "Начинающие программисты",
    "learning_objectives": ["Изучить основы Python"],
    "custom_category_name": "Программирование"
  }
}
```

**Response:**
```json
{
  "success": true,
  "course": {
    "id": "abc123",
    "title": "Изучение Python",
    "modules": [...],
    ...
  }
}
```

### GET `/health`

Проверка здоровья сервиса.

## Переменные окружения

### Бэкенд (`.env`)
```
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4
TEMPERATURE=0.7
HOST=0.0.0.0
PORT=8000
```

### Фронтенд (`.env.local`, опционально)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Особенности

- **Автоматический fallback** - если бэкенд недоступен, фронтенд использует мок-данные
- **Индикатор статуса API** - показывает подключение к бэкенду
- **Обработка ошибок** - graceful degradation при проблемах с API
- **Преобразование данных** - автоматическое преобразование между форматами фронтенда и бэкенда

## Разработка

### Бэкенд
```bash
cd backend
uvicorn app.main:app --reload
```

### Фронтенд
```bash
cd frontend
npm run dev
```

## Технологии

### Фронтенд
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- Lucide React

### Бэкенд
- FastAPI
- Python 3.10+
- LangChain
- LangGraph
- OpenAI GPT-4
- Pydantic
- Uvicorn

## Лицензия

MIT
