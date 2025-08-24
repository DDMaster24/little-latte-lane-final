# Little Latte Lane - Docker Setup Instructions

## 🐳 Docker Database Setup

This project now includes a complete Docker setup for local database development, eliminating the need to rely on external services during development.

### 📁 Docker Files Created

- `docker-compose.yml` - Main Docker Compose configuration
- `docker/init/01-init-db.sh` - Database initialization script
- `docker/init/02-create-theme-settings.sql` - Creates theme_settings table automatically
- `docker/test-connection.ps1` - PowerShell connection test script
- `docker/test-connection.sh` - Bash connection test script
- `.env.docker` - Docker-specific environment variables

### 🚀 Quick Start

1. **Start Docker services:**
   ```bash
   npm run docker:up
   ```

2. **Test connection:**
   ```bash
   npm run docker:test
   ```

3. **View logs:**
   ```bash
   npm run docker:logs
   ```

4. **Reset everything:**
   ```bash
   npm run docker:reset
   ```

### 🗄️ Database Access

- **PostgreSQL**: `postgresql://postgres:postgres@localhost:5432/little_latte_lane`
- **pgAdmin**: http://localhost:8080 (admin@littlelattlane.com / admin123)

### 📊 Services Included

1. **PostgreSQL 15** - Main database with automatic theme_settings table creation
2. **pgAdmin 4** - Web-based database management interface
3. **Initialization Scripts** - Automatic database setup with sample data

### 🔧 Features

- ✅ **Automatic table creation** - theme_settings table created on first start
- ✅ **Sample data** - Test data inserted automatically
- ✅ **Health checks** - Database readiness monitoring
- ✅ **Persistent volumes** - Data survives container restarts
- ✅ **Connection testing** - Built-in scripts to verify setup

### 🎯 Benefits

- **No Migration Conflicts** - Clean local database every time
- **Instant Setup** - One command to get database running
- **Isolated Development** - No interference with production data
- **Easy Testing** - Fresh database state for each test cycle
- **Visual Management** - pgAdmin for database inspection

### 🛠️ Troubleshooting

If containers don't start:
```bash
# Stop all containers
docker-compose down

# Remove volumes and restart
docker-compose down -v
docker-compose up -d

# Test connection
npm run docker:test
```

### 🔄 Integration with Visual Editor

The Docker setup automatically creates the `theme_settings` table that the visual editor needs, so you can:

1. Start Docker: `npm run docker:up`
2. Test the visual editor immediately
3. Save content to the local database
4. Inspect data via pgAdmin

This completely eliminates the database table creation issues we've been experiencing!
