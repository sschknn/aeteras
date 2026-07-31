import { Pool } from 'pg';

const dbUrl = process.env.DB_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/antiques_db';

export const pool = new Pool({
  connectionString: dbUrl,
  max: 10,
  idleTimeoutMillis: 30000,
});

export async function initDb() {
  try {
    const client = await pool.connect();
    console.log('[DB] Verbindung zu PostgreSQL erfolgreich hergestellt.');
    client.release();
  } catch (err) {
    console.warn('[DB] Postgres nicht erreichbar, schalte auf In-Memory Fallback um:', (err as Error).message);
  }
}
