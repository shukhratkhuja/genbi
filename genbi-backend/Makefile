.PHONY: help build up down logs shell db-shell test clean restart

help:
	@echo "Available commands:"
	@echo "  build     - Build Docker images"
	@echo "  up        - Start all services"
	@echo "  down      - Stop all services"
	@echo "  logs      - View logs"
	@echo "  shell     - Access backend container shell"
	@echo "  db-shell  - Access database shell"
	@echo "  test      - Run tests"
	@echo "  clean     - Clean up containers and volumes"
	@echo "  restart   - Restart all services"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

backend-logs:
	docker-compose logs -f backend

db-logs:
	docker-compose logs -f db

shell:
	docker-compose exec backend bash

db-shell:
	docker-compose exec db psql -U genbi_user -d genbi_db

test:
	docker-compose exec backend pytest tests/ -v

clean:
	docker-compose down -v
	docker system prune -f

restart:
	docker-compose restart

create-admin:
	docker-compose exec backend python scripts/create_admin.py

migration:
	docker-compose exec backend alembic revision --autogenerate -m "$(MESSAGE)"

migrate:
	docker-compose exec backend alembic upgrade head

# Проверка здоровья сервисов
health:
	@echo "Checking backend health..."
	@curl -f http://localhost:8000/health || echo "Backend not ready"
	@echo "\nChecking database..."
	@docker-compose exec db pg_isready -U genbi_user -d genbi_db || echo "Database not ready"
