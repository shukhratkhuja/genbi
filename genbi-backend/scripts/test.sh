#!/bin/bash

# Test script
set -e

echo "Running tests..."

# Install test dependencies
pip install -r requirements-dev.txt

# Run linting
echo "Running linting..."
black --check app/
isort --check-only app/
flake8 app/

# Run type checking
echo "Running type checking..."
mypy app/

# Run tests
echo "Running pytest..."
pytest tests/ -v --cov=app --cov-report=html

echo "All tests passed!"
