# Docker Database Connection Test Script (PowerShell)
# Test Docker database connection on Windows

Write-Host "Testing Docker database connection..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "SUCCESS: Docker is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if containers are running
$containerStatus = docker-compose ps
if ($containerStatus -match "little-latte-postgres.*Up") {
    Write-Host "SUCCESS: PostgreSQL container is running" -ForegroundColor Green
} else {
    Write-Host "WARNING: PostgreSQL container is not running. Starting containers..." -ForegroundColor Yellow
    docker-compose up -d postgres
    Write-Host "INFO: Waiting for database to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

# Test database connection
Write-Host "Testing PostgreSQL connection..." -ForegroundColor Cyan
try {
    $result = docker exec little-latte-postgres psql -U postgres -d little_latte_lane -c "SELECT 'Connection successful!' as status;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: PostgreSQL connection successful!" -ForegroundColor Green
        Write-Host $result
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "ERROR: PostgreSQL connection failed!" -ForegroundColor Red
    Write-Host $result
    exit 1
}

# Test theme_settings table
Write-Host "Testing theme_settings table..." -ForegroundColor Cyan
try {
    $tableResult = docker exec little-latte-postgres psql -U postgres -d little_latte_lane -c "SELECT COUNT(*) as record_count FROM theme_settings;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: theme_settings table accessible!" -ForegroundColor Green
        Write-Host $tableResult
    } else {
        throw "Table access failed"
    }
} catch {
    Write-Host "ERROR: theme_settings table not found!" -ForegroundColor Red
    Write-Host $tableResult
    exit 1
}

# Show container status
Write-Host "Container Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "COMPLETE: Docker database setup is working perfectly!" -ForegroundColor Green
Write-Host "Database URL: postgresql://postgres:postgres@localhost:5432/little_latte_lane" -ForegroundColor Yellow
Write-Host "pgAdmin URL: http://localhost:8080 (admin@littlelattlane.com / admin123)" -ForegroundColor Yellow
