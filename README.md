# Telegram Bot (Deno + grammY)

Проект Telegram-бота на Deno + TypeScript с хранением состояния и контента в PostgreSQL.

## Требования

- Deno v1.42+
- Docker (для Postgres и запуска в контейнере)

## Быстрый старт (локально, без Docker)

1. Установи Deno.
2. Скопируй `.env.example` в `.env` и укажи `BOT_TOKEN`.
3. Подними Postgres (опционально): `make pg-up`.
4. Примени миграции и сиды:
   ```bash
   make db-init
   ```
5. Запусти бота:
   ```bash
   make dev
   # или
   make start
   ```

## Запуск в Docker

1. Заполни `.env.prod`.
2. Собери и запусти контейнеры:
   ```bash
   make docker-build
   make docker-up
   ```
3. Примени миграции и сиды:
   ```bash
   make db-init
   ```
4. Админка доступна на `http://localhost:5173`.

## Переменные окружения

Локальная разработка — `.env`, запуск в Docker — `.env.prod`.

Обязательные:

- `BOT_TOKEN` — токен Telegram бота.

Дополнительные:

- `BOT_MODE` — `dev` или `prod` (по умолчанию `dev`).
- `DAILY_SEND_TIME` — время ежедневной отправки `HH:MM`.
- `DATABASE_URL` — строка подключения к Postgres.
- `HYDRATE_STATE` — `true/false`, восстанавливать состояние из БД.
- `POSTGRES_*` — параметры локального Postgres для docker-compose.

## База данных

Миграции: `migrations/`  
Сиды сообщений: `seeds/001_messages.sql` (подключает `seeds/days/*`).

Команды:

- `make db-migrate` — применить миграции.
- `make db-seed` — загрузить базовые сообщения.
- `make db-init` — сбросить схему, применить миграции и сиды.
- `make db-psql` — psql в контейнере.

## Makefile команды

- `make` — показать список команд.
- `make dev` — запуск в режиме разработки.
- `make start` — обычный запуск.
- `make typecheck` — проверка типов.
- `make lint` — линтер.
- `make fmt` — форматирование.
- `make docker-up` / `make docker-down` — старт/стоп контейнеров.
- `make docker-build` / `make docker-rebuild` — сборка образов.
- `make bot-logs` — логи контейнера бота.
- `make admin-logs` — логи контейнера админки.
- `make pg-up` / `make pg-down` — старт/стоп Postgres.

## Первый запуск (чек-лист)

1. `make pg-up`
2. `make db-init`
3. `make typecheck`
4. `make lint`
5. `make dev`

## Структура

- `src/index.ts` — точка входа и обработчики.
- `src/services/` — бизнес-логика и планировщик.
- `src/db/` — клиент БД, схемы, репозитории.
- `migrations/` — SQL-миграции.
- `seeds/` — сиды сообщений.

## Полезные ссылки

- Deno: https://docs.deno.com/runtime
- grammY: https://grammy.dev/guide
