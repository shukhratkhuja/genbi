#!/bin/bash

# Production deployment script
set -e

echo "Starting GenBI Platform deployment..."

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo "Error: .env.prod file not found"
    echo "Please copy .env.prod.example to .env.prod and configure it"
    exit 1
fi

# Load environment variables
source .env.prod

# Create necessary directories
mkdir -p backups
mkdir -p logs
mkdir -p ssl

# Pull latest code
git pull origin main

# Build and start services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Create admin user if it doesn't exist
docker-compose -f docker-compose.prod.yml exec backend python scripts/create_admin.py

echo "Deployment completed successfully!
echo "API is available at: https://your-domain.com/api"
echo "Health check: https://your-domain.com/health"