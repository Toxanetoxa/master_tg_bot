# Admin Panel (Vue + Express)

Цель: админка для редактирования дней, сообщений, feedback и просмотра пользователей. Доступ — только для админов через Telegram Login. Админка может работать локально или в Docker на порту `5173`.

## Стек

- **Frontend**: Vue 3 + Vite (порт `5173`).
- **Backend**: Node.js + Express (минимум зависимостей).
- **Auth**: Telegram Login Widget, валидация подписи на backend.
- **DB**: Postgres (используем текущие таблицы `bot_*`).

## Авторизация через Telegram

1. Пользователь нажимает кнопку Telegram Login.
2. Telegram возвращает данные пользователя + `hash`.
3. Backend проверяет подпись (HMAC-SHA256 от `data_check_string`).
4. Backend ищет пользователя в `users` по `tg_user_id`.
5. Доступ разрешается только если `users.role = 'admin'`.
6. Backend выдаёт cookie‑сессию (`admin_session`) и держит её на стороне сервера.

## Миграции

Добавляем `role` в `users`:

- `role` TEXT NOT NULL DEFAULT 'user'
- допустимые значения: `user`, `admin`

Миграция: `migrations/005_add_user_role.sql`.

## Функциональность

### Просмотр и редактирование

- **Дни**:
  - список дней (`bot_days`)
  - редактирование `day_number`, `is_premium`, `reminders`
  - отдельная страница “Премиум дни” с быстрым переключением `is_premium`

- **Сообщения**:
  - список сообщений внутри дня (`bot_messages`)
  - редактирование `step_index`, `message_text`
  - добавление/удаление сообщения
  - напоминание для шага с feedback (`reminder_text`)

- **Feedback**:
  - кнопки (`bot_feedback_buttons`) для сообщения
  - ответы (`bot_feedback_messages`) для сообщения
  - добавление/удаление/изменение типа и текста

### Дополнительно

- **Пользователи**:
  - список пользователей (`users`)
  - поиск по `username/first_name/last_name`
  - карточка пользователя с ролью и метаданными
- **Платежи**:
  - список платежей (`payments`)
  - аналитика по месяцам (подписки/выручка)
  - прогресс пользователей по дням (`user_state`)

### Навигация UI

- Переключение страниц в хедере:
  - Редактор
  - Премиум дни
  - Пользователи

- простая таблица + формы без сложных компонентов
- авто‑сохранение не требуется — только кнопка “Сохранить”

## API (backend)

### Auth

- `POST /auth/telegram` — проверка подписи и установка сессии
- `POST /auth/logout` — выход
- `GET /auth/me` — текущий пользователь

### Days

- `GET /api/days`
- `POST /api/days`
- `PUT /api/days/:id`
- `DELETE /api/days/:id`

### Messages

- `GET /api/days/:dayId/messages`
- `POST /api/days/:dayId/messages`
- `PUT /api/messages/:id`
- `DELETE /api/messages/:id`

### Feedback

- `GET /api/messages/:messageId/feedback`
- `POST /api/messages/:messageId/feedback/buttons`
- `POST /api/messages/:messageId/feedback/messages`
- `PUT /api/feedback/buttons/:id`
- `PUT /api/feedback/messages/:id`
- `DELETE /api/feedback/buttons/:id`
- `DELETE /api/feedback/messages/:id`

### Users

- `GET /api/users`

### Payments

- `GET /api/payments`
- `GET /api/analytics`

## Docker

Сервис `admin` (опционально):

- порт `5173`
- env:
  - `DATABASE_URL`
  - `TELEGRAM_BOT_TOKEN`
  - `VITE_TG_BOT_USERNAME`

## План разработки (по шагам)

1. **Миграция роли**
   - добавить `role` в `users`
   - выставить роль `admin` нужному пользователю

2. **Backend (Express)**
   - init `admin` сервиса (`/admin` папка)
   - подключение к Postgres (pg)
   - middleware сессий (cookie + in-memory store или simple file store)
   - проверка Telegram подписи
   - guard `requireAdmin`
   - CRUD для days/messages/feedback

3. **Frontend (Vue)**
   - экран логина с Telegram widget
   - список дней + переход на день
   - список сообщений внутри дня
   - простые формы для редактирования
   - управление feedback кнопками/ответами

4. **Docker**
   - добавить Dockerfile для admin сервиса
   - добавить сервис `admin` в `docker-compose.yml`
   - пробросить порт `5173`

5. **Полировка**
   - валидация форм
   - обработка ошибок
   - базовые уведомления (success/error)

## Риски и ограничения

- Telegram login требует публичного домена или локального туннеля (ngrok).
- Для локальной разработки можно временно отключать auth через env.
- Сессии в памяти годятся только для одного инстанса.
