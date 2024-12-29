import { db } from "@/db"
import { systems } from "@/db/schema"
import { asc } from "drizzle-orm"

export async function getSystems() {
    const results = await db.select().from(systems).orderBy(asc(systems.name))
    return results
}

export type getSystemsType = Awaited<ReturnType<typeof getSystems>>[0]
