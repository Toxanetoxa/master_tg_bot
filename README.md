# Telegram Bot (Deno + grammY)

Проект Telegram-бота на Deno + TypeScript с хранением состояния и контента в PostgreSQL + админка для контента и оплатой через ЮKassa.

## Требования

- Deno v2+
- Node.js 20+ (для админки)
- Docker (Postgres, bot, admin, ngrok) — опционально

## Быстрый старт (локально, без Docker)

1. Установи Deno и Node.js.
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
6. Запусти админку:
   ```bash
   cd admin
   pnpm install
   pnpm dev
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
4. Админка доступна на `http://localhost:5173` (если сервис admin включен).

## Админка и Telegram Login

- Для входа нужен Telegram Login Widget.
- В `admin/.env` задай `VITE_TG_BOT_USERNAME`.
- Для локального входа можно включить обход авторизации:
  ```bash
  ADMIN_AUTH_DISABLED=true
  ```

## ngrok (локальная авторизация через Telegram и webhooks)

1. Укажи `NGROK_AUTHTOKEN` в `.env`.
2. Запусти Docker (`make docker-up`).
3. Получи публичный URL для нужного туннеля:
   ```bash
   docker compose logs -f ngrok
   ```
4. Укажи домен в BotFather через `/setdomain` (для Telegram Login).
5. Для webhooks ЮKassa используй URL туннеля `/webhooks/yookassa`.

## Платежи (ЮKassa)

Бот создает платеж и отправляет пользователю кнопку оплаты. После оплаты ЮKassa присылает webhook.

Endpoints:
- `POST /webhooks/yookassa` — обработка событий оплаты.
- `GET /return` — страница возврата в Telegram.

Минимальные шаги:
1. Заполни `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`, `YOOKASSA_RETURN_URL`, `YOOKASSA_WEBHOOK_PORT`.
2. Запусти бота и HTTP сервер (порт из `YOOKASSA_WEBHOOK_PORT`).
3. В ЮKassa добавь webhook URL: `https://<domain>/webhooks/yookassa`.
4. В `YOOKASSA_RETURN_URL` укажи `https://<domain>/return`.

## Напоминания (feedback)

Если пользователь остановился на шаге с feedback-кнопками и не нажал кнопку за 12 часов, бот отправляет напоминание.

Как это работает:
- напоминания ставятся автоматически при остановке на шаге с кнопками;
- при ответе пользователя напоминание очищается;
- текст берется из `reminder_text` (если задан), иначе — случайный дефолтный.

## Переменные окружения

Локальная разработка — `.env`, запуск в Docker — `.env.prod`, админка — `admin/.env`.

Обязательные:

- `BOT_TOKEN` — токен Telegram бота.
- `DATABASE_URL` — строка подключения к Postgres.

Дополнительные:

- `BOT_MODE` — `dev` или `prod` (по умолчанию `dev`).
- `DAILY_SEND_TIME` — время ежедневной отправки `HH:MM`.
- `HYDRATE_STATE` — `true/false`, восстанавливать состояние из БД.
- `POSTGRES_*` — параметры Postgres для docker-compose.
- `ADMIN_COOKIE_SECRET` — секрет подписи сессий админки.
- `VITE_TG_BOT_USERNAME` — username бота (для Telegram Login).
- `NGROK_AUTHTOKEN` — токен ngrok.
- `BOT_USERNAME` — username бота (для return_url страницы).
- `YOOKASSA_SHOP_ID` — идентификатор магазина ЮKassa.
- `YOOKASSA_SECRET_KEY` — секретный ключ ЮKassa.
- `YOOKASSA_RETURN_URL` — URL страницы возврата после оплаты.
- `YOOKASSA_WEBHOOK_PORT` — порт HTTP сервера для webhooks.
- `YOOKASSA_WEBHOOK_AUTH` — опциональная авторизация webhook (можно пустым).
- `REMINDER_DELAY_HOURS` — задержка напоминания в часах (по умолчанию 12).

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
- `make dev` — запуск бота в режиме разработки.
- `make start` — запуск бота.
- `make typecheck` — проверка типов.
- `make lint` — линтер.
- `make fmt` — форматирование.
- `make docker-up` / `make docker-down` — старт/стоп контейнеров.
- `make docker-build` / `make docker-rebuild` — сборка образов.
- `make admin-rebuild` — пересборка только админки.
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
- `admin/` — фронтенд + API админки.

## Полезные ссылки

- Deno: https://docs.deno.com/runtime
- grammY: https://grammy.dev/guide

## Troubleshooting

- **Нет кнопки Telegram Login** — проверь `VITE_TG_BOT_USERNAME` в `admin/.env` и перезапусти `pnpm dev`.
- **Blocked request (Vite allowedHosts)** — добавь домен ngrok в `admin/vite.config.ts` и перезапусти dev‑сервер.
- **403 в админке** — у пользователя в `users.role` должно быть `admin` (или включи `ADMIN_AUTH_DISABLED=true` в dev).
- **409 step_index** — номер шага уже занят; измени `step_index`.
- **Нет webhook-ов ЮKassa** — проверь `YOOKASSA_WEBHOOK_PORT`, актуальный ngrok URL и отсутствие `YOOKASSA_WEBHOOK_AUTH` (если не используешь).
