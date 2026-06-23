import { migrate } from "drizzle-orm/node-postgres/migrator"
import { getDb } from "./index"

const main = async () => {
    const db = await getDb()
    console.log("Running migrations...")

    try {
        await migrate(db, {
            migrationsFolder: "src/db/migrations",
        })
        console.log("Migration completed")
        process.exit(0)
    } catch (error) {
        console.error("Error during migration: ", error)
        process.exit(1)
    }
}

main()
