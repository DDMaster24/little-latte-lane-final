import postgres from 'postgres'

// Use the exact Supabase Node.js connection format (Transaction pooler - IPv4 compatible)
const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString)

export default sql
