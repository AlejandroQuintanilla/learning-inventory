import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida. Revisa tu archivo .env.local');
}

// Cliente SQL raw (para consultas directas con template literals)
export const sql = neon(process.env.DATABASE_URL);

// Cliente Drizzle ORM (para consultas tipadas)
export const db = drizzle(sql, { schema });
