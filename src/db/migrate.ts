import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";

const main = async () => {
  console.log("Running migrations...");

  try {
    await migrate(db, {
      migrationsFolder: "src/db/migrations",
    });
    console.log("Migration completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during migration: ", error);
    process.exit(1);
  }
};

main();
