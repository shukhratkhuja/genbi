.PHONY: help build up down logs shell db-shell test clean restart install-frontend install-backend dev-frontend dev-backend

help:
	@echo "Available commands:"
	@echo "  build              - Build all Docker images"
	@echo "  up                 - Start all services"
	@echo "  down               - Stop all services"
	@echo "  logs               - View logs for all services"
	@echo "  restart            - Restart all services"
	@echo "  clean              - Clean up containers and volumes"
	@echo ""
	@echo "Development commands:"
	@echo "  install-frontend   - Install frontend dependencies"
	@echo "  install-backend    - Install backend dependencies"
	@echo "  dev-frontend       - Start frontend in development mode"
	@echo "  dev-backend        - Start backend in development mode"
	@echo "  dev                - Start both frontend and backend in dev mode"
	@echo ""
	@echo "Database commands:"
	@echo "  db-shell           - Access database shell"
	@echo "  create-admin       - Create admin user"
	@echo "  migration          - Create new migration"
	@echo "  migrate            - Run database migrations"
	@echo ""
	@echo "Service-specific commands:"
	@echo "  backend-logs       - View backend logs"
	@echo "  frontend-logs      - View frontend logs"
	@echo "  db-logs            - View database logs"
	@echo "  backend-shell      - Access backend container shell"
	@echo "  test               - Run backend tests"
	@echo "  health             - Check services health"

# Docker commands
build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

restart:
	docker-compose restart

clean:
	docker-compose down -v
	docker system prune -f

# Development setup
install-frontend:
	cd frontend && npm install

install-backend:
	cd backend && pip3 install -r ../requirements.txt

install: install-frontend install-backend

# Development mode
dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev:
	@echo "Starting development servers..."
	@echo "Backend will be available at: http://localhost:8000"
	@echo "Frontend will be available at: http://localhost:3000"
	@echo ""
	@echo "To start both services, run in separate terminals:"
	@echo "  make dev-backend"
	@echo "  make dev-frontend"

# Service-specific logs
backend-logs:
	docker-compose logs -f backend

frontend-logs:
	docker-compose logs -f frontend

db-logs:
	docker-compose logs -f db

# Shell access
backend-shell:
	docker-compose exec backend bash

frontend-shell:
	docker-compose exec frontend sh

db-shell:
	docker-compose exec db psql -U genbi_user -d genbi_db

# Database operations
create-admin:
	docker-compose exec backend python scripts/create_admin.py

migration:
	@if [ -z "$(MESSAGE)" ]; then \
		echo "Error: MESSAGE is required. Usage: make migration MESSAGE='Your migration message'"; \
		exit 1; \
	fi
	docker-compose exec backend alembic revision --autogenerate -m "$(MESSAGE)"

migrate:
	docker-compose exec backend alembic upgrade head

# Testing
test:
	docker-compose exec backend pytest tests/ -v

# Production deployment
deploy-prod:
	docker-compose --profile production up -d --build

# Health check
health:
	@echo "Checking backend health..."
	@curl -f http://localhost:8000/health || echo "Backend not ready"
	@echo "\nChecking frontend health..."
	@curl -f http://localhost:3000 || echo "Frontend not ready"
	@echo "\nChecking database..."
	@docker-compose exec db pg_isready -U genbi_user -d genbi_db || echo "Database not ready"

# Backup and restore
backup:
	@mkdir -p backups
	@echo "Creating database backup..."
	@docker-compose exec -T db pg_dump -U genbi_user genbi_db > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup created in backups/ directory"

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE is required. Usage: make restore FILE=backup_file.sql"; \
		exit 1; \
	fi
	@echo "Restoring database from $(FILE)..."
	@docker-compose exec -T db psql -U genbi_user -d genbi_db < $(FILE)
	@echo "Database restored successfully"

# Development utilities
format-backend:
	cd backend && black app/ --line-length 88
	cd backend && isort app/

lint-backend:
	cd backend && flake8 app/
	cd backend && mypy app/

lint-frontend:
	cd frontend && npm run lint

format-frontend:
	cd frontend && npm run format

# Environment setup
setup-env:
	@echo "Setting up environment files..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file from .env.example"; \
		echo "Please update .env with your configuration"; \
	fi

# Full setup for new developers
setup: setup-env install
	@echo "Building Docker images..."
	@make build
	@echo ""
	@echo "Starting services..."
	@make up
	@echo ""
	@echo "Waiting for services to be ready..."
	@sleep 10
	@echo ""
	@echo "Running database migrations..."
	@make migrate
	@echo ""
	@echo "Creating admin user..."
	@make create-admin
	@echo ""
	@echo "Setup complete! Services are running:"
	@echo "  Backend:  http://localhost:8000"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Database: localhost:5433"