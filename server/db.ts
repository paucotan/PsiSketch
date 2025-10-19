import dotenv from "dotenv";
dotenv.config();
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

type Database = ReturnType<typeof drizzle<typeof schema>>;

let cachedConnectionString: string | null = null;
let cachedPool: Pool | undefined;
let cachedDb: Database | undefined;

export function hasDatabaseConfig(): boolean {
  return typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0;
}

export function ensureDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  if (!cachedPool || !cachedDb || cachedConnectionString !== connectionString) {
    cachedConnectionString = connectionString;
    cachedPool = new Pool({ connectionString });
    cachedDb = drizzle({ client: cachedPool, schema });
  }

  if (!cachedPool || !cachedDb) {
    throw new Error("Failed to initialize the database client");
  }

  return {
    connectionString,
    pool: cachedPool,
    db: cachedDb,
  };
}
