#!/bin/bash
# Docker Database Connection Test Script

set -e

echo "🔍 Testing Docker database connection..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check if containers are running
if ! docker-compose ps | grep -q "little-latte-postgres.*Up"; then
    echo "⚠️ PostgreSQL container is not running. Starting containers..."
    docker-compose up -d postgres
    echo "⏳ Waiting for database to be ready..."
    sleep 10
fi

# Test database connection
echo "🔌 Testing PostgreSQL connection..."
if docker exec little-latte-postgres psql -U postgres -d little_latte_lane -c "SELECT 'Connection successful!' as status;"; then
    echo "✅ PostgreSQL connection successful!"
else
    echo "❌ PostgreSQL connection failed!"
    exit 1
fi

# Test theme_settings table
echo "🗄️ Testing theme_settings table..."
if docker exec little-latte-postgres psql -U postgres -d little_latte_lane -c "SELECT COUNT(*) as record_count FROM theme_settings;"; then
    echo "✅ theme_settings table accessible!"
else
    echo "❌ theme_settings table not found!"
    exit 1
fi

# Show container status
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🎉 Docker database setup is working perfectly!"
echo "🔗 Database URL: postgresql://postgres:postgres@localhost:5432/little_latte_lane"
echo "🌐 pgAdmin URL: http://localhost:8080 (admin@littlelattlane.com / admin123)"
