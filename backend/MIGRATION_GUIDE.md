# Руководство по миграциям базы данных

## Установка зависимостей

```bash
cd backend
pip install -r requirements.txt
```

## Настройка базы данных

1. Создайте файл `.env` на основе `env.example`
2. Укажите `DATABASE_URL` в формате:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/fillai_db
   ```

## Создание первой миграции

```bash
# Создать миграцию на основе моделей
alembic revision --autogenerate -m "Initial migration"

# Применить миграцию
alembic upgrade head
```

## Работа с миграциями

```bash
# Создать новую миграцию
alembic revision --autogenerate -m "Description of changes"

# Применить все миграции
alembic upgrade head

# Откатить последнюю миграцию
alembic downgrade -1

# Просмотреть историю миграций
alembic history

# Просмотреть текущую версию
alembic current
```

## Для продакшена

```bash
# Применить миграции при деплое
alembic upgrade head
```

