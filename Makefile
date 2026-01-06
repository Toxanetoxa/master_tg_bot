.PHONY: help docker-up docker-down docker-logs postgres-up postgres-down up down logs pg-up pg-down ps db-migrate db-reset db-psql db-seed db-init lint fmt start dev typecheck docker-build docker-rebuild bot-logs bot-shell admin-logs admin-rebuild

help: ## Показать список доступных команд
	@awk 'BEGIN {FS = ":.*##"; printf "Доступные команды:\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

docker-up: ## Запустить все docker-сервисы
	docker compose up -d

up: docker-up ## Алиас: запустить все docker-сервисы

docker-down: ## Остановить и удалить все docker-сервисы
	docker compose down

down: docker-down ## Алиас: остановить и удалить все docker-сервисы

docker-logs: ## Следить за логами всех docker-сервисов
	docker compose logs -f

logs: docker-logs ## Алиас: следить за логами всех docker-сервисов

docker-build: ## Собрать docker-образы
	docker compose build

docker-rebuild: ## Пересобрать docker-образы без кэша
	docker compose build --no-cache

ps: ## Показать статус docker-сервисов
	docker compose ps

db-migrate: ## Применить миграции БД (deno task)
	deno task db:migrate

db-reset: ## Сбросить схему public и повторно применить миграции
	docker compose exec -T postgres psql -U $${POSTGRES_USER:-bot} -d $${POSTGRES_DB:-bot} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	deno task db:migrate

db-psql: ## Открыть psql внутри контейнера Postgres
	docker compose exec postgres psql -U $${POSTGRES_USER:-bot} -d $${POSTGRES_DB:-bot}

db-seed: ## Загрузить базовые сообщения в БД
	docker compose up -d --force-recreate postgres
	deno task db:migrate
	docker compose exec -T postgres psql -U $${POSTGRES_USER:-bot} -d $${POSTGRES_DB:-bot} -f /seeds/001_messages.sql

db-init: ## Сбросить схему, применить миграции и загрузить сиды
	$(MAKE) db-reset
	$(MAKE) db-seed

lint: ## Запустить линтер Deno
	deno task lint

fmt: ## Запустить форматирование Deno
	deno task fmt

start: ## Запустить бота (Deno)
	deno task start

dev: ## Запустить бота в режиме разработки (watch)
	deno task dev

typecheck: ## Проверить типы TypeScript (Deno)
	deno check src/index.ts

bot-logs: ## Следить за логами контейнера бота
	docker compose logs -f bot

bot-shell: ## Открыть shell в контейнере бота
	docker compose exec bot sh

admin-logs: ## Следить за логами контейнера админки
	docker compose logs -f admin

admin-rebuild: ## Пересобрать только образ админки без кэша
	docker compose build --no-cache admin

postgres-up: ## Запустить только postgres
	docker compose up -d postgres

pg-up: postgres-up ## Алиас: запустить только postgres

postgres-down: ## Остановить только postgres
	docker compose stop postgres

pg-down: postgres-down ## Алиас: остановить только postgres

default: help
