# Docker Development Guide

## Prerequisites
- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Start the services:**
   ```bash
   docker-compose up -d
   ```

2. **Stop the services:**
   ```bash
   docker-compose down
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

## Services

### PostgreSQL Database
- **Port:** 5432
- **Database:** little_latte_lane
- **Username:** postgres
- **Password:** postgres
- **Connection String:** `postgresql://postgres:postgres@localhost:5432/little_latte_lane`

### Redis Cache
- **Port:** 6379
- **Connection String:** `redis://localhost:6379`

### pgAdmin (Database Management)
- **URL:** http://localhost:8080
- **Email:** admin@littlelatte.com
- **Password:** admin123

## Environment Setup

1. **Copy Docker environment:**
   ```bash
   cp .env.docker .env.local
   ```

2. **Update your .env.local with Docker settings:**
   ```
   # Use Docker database
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/little_latte_lane
   ```

## Development Workflow

1. **Start Docker services:**
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Run database migrations (if using Prisma/Supabase CLI):**
   ```bash
   npm run db:migrate
   ```

3. **Start Next.js development server:**
   ```bash
   npm run dev
   ```

4. **Access pgAdmin for database management:**
   - Open http://localhost:8080
   - Login with admin@littlelatte.com / admin123
   - Add server: Host=postgres, Port=5432, User=postgres, Password=postgres

## Data Management

### Backup Database
```bash
docker exec little-latte-postgres pg_dump -U postgres little_latte_lane > backup.sql
```

### Restore Database
```bash
docker exec -i little-latte-postgres psql -U postgres little_latte_lane < backup.sql
```

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### Port Conflicts
If ports 5432, 6379, or 8080 are in use, update the ports in `docker-compose.yml`:
```yaml
ports:
  - "15432:5432"  # Use port 15432 instead of 5432
```

### Database Connection Issues
1. Ensure Docker services are running: `docker-compose ps`
2. Check service logs: `docker-compose logs postgres`
3. Verify connection string in `.env.local`

### Data Persistence
- Database data is stored in Docker volumes
- To completely reset: `docker-compose down -v` (warning: deletes all data)

## Production Notes
- This setup is for development only
- Use managed databases (Supabase, AWS RDS, etc.) in production
- Never use default passwords in production
