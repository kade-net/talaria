import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres'
import * as schema from './schema'
export * as orm from 'drizzle-orm';

const queryClient = postgres(process.env.PG_CONNECTION_STRING!);

const db: PostgresJsDatabase<typeof schema> = drizzle(queryClient, {
    schema
})

export default db;
