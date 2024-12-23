import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL!);

// logger
// const db = drizzle(sql, { logger: true });
const db = drizzle(sql);

export { db };
