#!/bin/bash
# troubleshoot.sh

echo "🔍 GenBI Platform Troubleshooting..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "💡 Create .env file with: echo 'OPENAI_API_KEY=your-key' > .env"
    exit 1
else
    echo "✅ .env file exists"
fi

# Check if OPENAI_API_KEY is set
if grep -q "OPENAI_API_KEY=" .env; then
    echo "✅ OPENAI_API_KEY is configured"
else
    echo "❌ OPENAI_API_KEY not found in .env"
    echo "💡 Add your OpenAI API key to .env file"
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed"
    exit 1
else
    echo "✅ Docker is available"
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not installed"
    exit 1
else
    echo "✅ Docker Compose is available"
fi

# Check if containers are running
echo "📊 Checking container status..."
docker-compose ps

# Check logs for errors
echo "📝 Recent backend logs:"
docker-compose logs --tail=10 backend

echo "📝 Recent database logs:"
docker-compose logs --tail=10 db

# Test API endpoints
echo "🔗 Testing API endpoints..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API is responding"
else
    echo "❌ Backend API not responding"
    echo "💡 Check backend logs: docker-compose logs backend"
fi

# Test database connection
echo "🗄️ Testing database connection..."
if docker-compose exec -T db pg_isready -U genbi_user -d genbi_db > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "❌ Database not ready"
    echo "💡 Check database logs: docker-compose logs db"
fi

echo "🎯 Troubleshooting complete!"
