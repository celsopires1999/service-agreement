import { db } from "@/db"
import {
    agreements,
    plans,
    services,
    serviceSystems,
    systems,
    userListItems,
    userLists,
    users,
} from "@/db/schema"

export async function cleanTables() {
    try {
        await db.delete(userListItems)
        await db.delete(userLists)
        await db.delete(serviceSystems)
        await db.delete(services)
        await db.delete(systems)
        await db.delete(agreements)
        await db.delete(plans)
        await db.delete(users)
    } catch (error) {
        console.error("Error during cleaning tables:", error)
        throw new Error("Tables cleaning failed", { cause: error })
    }
}
