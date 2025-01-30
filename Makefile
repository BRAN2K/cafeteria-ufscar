# Makefile na raiz
SHELL := /bin/bash
.ONESHELL:
.SHELLFLAGS := -euo pipefail -c

# Carrega env do .env
include .env

export PROJECT_NAME
export DB_PASSWORD
export DB_USER
export DB_NAME
export DB_HOST
export DB_PORT
export NODE_ENV
export API_PORT
export FRONTEND_PORT

.PHONY: dev-front dev-back up down build logs db-up db-down migrate-latest migrate-rollback migrate-create

dev-front:
	cd presentation && npm run dev

dev-back:
	cd webapi && npm run dev

back:
	cd webapi && npx repomix

front:
	cd presentation && npx repomix

# Sobe todos os serviços
up:
	@docker-compose up -d

# Desce todos os serviços
down:
	@docker-compose down

# Builda as imagens
build:
	@docker-compose build

# Logs
logs:
	@docker-compose logs -f

db-up:
	@docker-compose -f webapi/docker-compose.db.yml up -d
	
db-down:
	@docker-compose -f webapi/docker-compose.db.yml down

migrate-latest:
	cd webapi && npm run migrate:latest

migrate-rollback:
	cd webapi && npm run migrate:rollback

migrate-create:
	cd webapi && npx knex migrate:make $(name) -x ts
