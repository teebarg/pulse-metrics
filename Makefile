APP_NAME        ?= pulse-api
DOCKER_USERNAME ?= beafdocker
IMAGE_NAME      ?= $(DOCKER_USERNAME)/$(APP_NAME)

# Versioning
VERSION         ?= $(shell git describe --tags --always --dirty)
TAG             ?= $(VERSION)

DOCKERFILE      ?= apps/api/Dockerfile
PLATFORM        ?= linux/amd6

DOCKER_COMPOSE = docker compose
SERVICE = pulse-metrics

.PHONY: all
all: build up

.PHONY: build-dev
build-dev:
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

.PHONY: build
build:
	docker build --platform $(PLATFORM) -f $(DOCKERFILE) -t $(IMAGE_NAME):$(TAG) .

.PHONY: tag
tag:
	docker tag $(IMAGE_NAME):$(TAG) $(IMAGE_NAME):latest

.PHONY: push
push:
	docker push $(IMAGE_NAME):$(TAG)
	docker push $(IMAGE_NAME):latest

.PHONY: release
release: build tag push

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make dev         - Run the development server"
	@echo "  make build       - Build the production application"
	@echo "  make start       - Start the production server"
	@echo "  make prettier    - Run prettier"
