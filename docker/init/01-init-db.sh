#!/bin/bash
# Initialize local database with basic schema

set -e

echo "🔧 Initializing Little Latte Lane local database..."

# Create database extensions
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    
    -- Create basic schema structure for local development
    CREATE SCHEMA IF NOT EXISTS public;
    
    -- Grant permissions
    GRANT ALL ON SCHEMA public TO postgres;
    GRANT ALL ON SCHEMA public TO public;
    
    -- Create a simple test table to verify connection
    CREATE TABLE IF NOT EXISTS connection_test (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        message TEXT DEFAULT 'Docker connection working!',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Insert test data
    INSERT INTO connection_test (message) VALUES ('Local Docker database initialized successfully!');
    
    COMMENT ON TABLE connection_test IS 'Test table to verify Docker database connection';
EOSQL

echo "✅ Local database initialization complete!"
