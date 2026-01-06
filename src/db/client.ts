import 'jsr:@std/dotenv@0.224.0/load';
import postgres from 'npm:postgres@3.4.4';
import { drizzle } from 'npm:drizzle-orm@0.36.4/postgres-js';

const databaseUrl = Deno.env.get('DATABASE_URL');
if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL in environment variables');
}

export const sql = postgres(databaseUrl, { max: 5 });
export const db = drizzle(sql);
