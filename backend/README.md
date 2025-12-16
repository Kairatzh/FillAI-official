# Backend API - Генерация курсов с использованием AI

FastAPI сервис для генерации образовательных курсов с использованием LangChain, LangGraph и мультиагентной системы.

## Архитектура

### Мультиагентная система

1. **CourseStructureAgent** - создает структуру курса (модули и уроки)
2. **LessonDetailAgent** - детализирует содержание каждого урока
3. **CourseCoordinator** - координирует работу агентов

### Технологии

- **FastAPI** - веб-фреймворк
- **LangChain** - фреймворк для работы с LLM
- **LangGraph** - для создания агентных систем
- **OpenAI GPT-4** - языковая модель
- **Pydantic** - валидация данных

## Установка

1. Создайте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

4. Добавьте ваш OpenAI API ключ в `.env`:
```
OPENAI_API_KEY=your_api_key_here
```

## Запуск

### Режим разработки

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Продакшн

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### POST `/api/courses/generate`

Генерирует курс на основе настроек.

**Request Body:**
```json
{
  "settings": {
    "title": "Изучение Python",
    "description": "Курс для начинающих",
    "difficulty": "beginner",
    "duration_hours": 20,
    "target_audience": "Начинающие программисты",
    "learning_objectives": ["Изучить основы Python", "Написать первые программы"],
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
    "description": "Курс для начинающих",
    "category": "Программирование",
    "difficulty": "beginner",
    "modules": [...],
    "total_duration_hours": 20,
    "learning_objectives": [...]
  },
  "message": "Курс успешно сгенерирован"
}
```

### GET `/health`

Проверка здоровья сервиса.

### GET `/`

Информация о API.

## Структура проекта

```
backend/
├── app/
│   ├── main.py              # FastAPI приложение
│   ├── models.py            # Pydantic модели
│   ├── agents/
│   │   ├── course_agent.py      # Агент структуры курса
│   │   ├── lesson_agent.py      # Агент детализации уроков
│   │   └── course_coordinator.py # Координатор агентов
│   └── services/
│       └── prompt_templates.py  # Шаблоны промптов
├── requirements.txt
├── .env.example
└── README.md
```

## Процесс генерации курса

1. **Получение запроса** - FastAPI получает настройки курса от фронтенда
2. **Создание структуры** - `CourseStructureAgent` создает модули и уроки
3. **Детализация уроков** - `LessonDetailAgent` параллельно обрабатывает все уроки
4. **Формирование курса** - `CourseCoordinator` собирает финальный курс
5. **Возврат результата** - курс отправляется обратно на фронтенд

## Переменные окружения

- `OPENAI_API_KEY` - API ключ OpenAI (обязательно)
- `OPENAI_MODEL` - модель OpenAI (по умолчанию: gpt-4)
- `TEMPERATURE` - температура модели (по умолчанию: 0.7)
- `HOST` - хост сервера (по умолчанию: 0.0.0.0)
- `PORT` - порт сервера (по умолчанию: 8000)

## Разработка

Для разработки рекомендуется использовать hot-reload:

```bash
uvicorn app.main:app --reload
```

API документация доступна по адресу:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

