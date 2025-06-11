#!/bin/bash

# Linting script
set -e

echo "Running code formatting and linting..."

# Format code
black app/
isort app/

# Check with flake8
flake8 app/

# Type checking
mypy app/

echo "Linting completed!"