import "server-only"

import { db } from "@/db"
import { systems } from "@/db/schema"
import { asc, eq, or, ilike } from "drizzle-orm"

export async function getSystems() {
    const results = await db.select().from(systems).orderBy(asc(systems.name))
    return results
}

export async function getSystem(systemId: string) {
    const result = await db
        .select()
        .from(systems)
        .where(eq(systems.systemId, systemId))
        .limit(1)
    return result[0]
}

export async function getSystemSearchResults(searchText: string) {
    const results = await db
        .select()
        .from(systems)
        .where(
            or(
                ilike(systems.name, `%${searchText}%`),
                ilike(systems.description, `%${searchText}%`),
                ilike(systems.applicationId, `%${searchText}%`),
            ),
        )
        .orderBy(asc(systems.name))

    return results
}

export type getSystemsType = Awaited<ReturnType<typeof getSystems>>[number]
export type getSystemType = Awaited<ReturnType<typeof getSystem>>
export type getSystemSearchResultsType = Awaited<
    ReturnType<typeof getSystemSearchResults>
>[number]
