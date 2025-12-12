DOCKER_COMPOSE = docker compose
SERVICE = pulse-metrics

.PHONY: all
all: build up

.PHONY: build
build:
	$(DOCKER_COMPOSE) build

.PHONY: up
up:
	$(DOCKER_COMPOSE) up

.PHONY: update
update:
	$(DOCKER_COMPOSE) up -d

.PHONY: down
down:
	$(DOCKER_COMPOSE) down

.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f $(service)

.PHONY: bash
bash:
	$(DOCKER_COMPOSE) exec $(SERVICE) /bin/sh

.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans

.PHONY: deploy
deploy:
	vercel deploy --prod

.PHONY: serve-app
serve-app:
	@cd apps/web && pnpm dev

.PHONY: serve-api
serve-api:
	@cd apps/api && pnpm dev

.PHONY: dev
dev:
	make -j 2 serve-api serve-app

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make dev         - Run the development server"
	@echo "  make build       - Build the production application"
	@echo "  make start       - Start the production server"
	@echo "  make prettier    - Run prettier"
