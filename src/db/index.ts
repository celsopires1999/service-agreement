import * as schema from "@/db/schema"
import { drizzle } from "drizzle-orm/node-postgres"
import { config } from "dotenv"

config({ path: ".env.local" })

const db = drizzle(process.env.DATABASE_URL!, { schema })

export { db }
