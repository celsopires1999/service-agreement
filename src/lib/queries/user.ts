import "server-only"

import { db } from "@/db"
import { users } from "@/db/schema"
import { asc, eq, ilike, or } from "drizzle-orm"

export async function getUserByEmail(email: string) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
    return result[0]
}

export async function getUser(userId: string) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.userId, userId))
        .limit(1)
    return result[0]
}

export async function getUserSearchResults(searchText: string) {
    const results = await db
        .select()
        .from(users)
        .where(
            or(
                ilike(users.name, `%${searchText}%`),
                ilike(users.email, `%${searchText}%`),
            ),
        )
        .orderBy(asc(users.name))

    return results
}

export type getUserSearchResultsType = Awaited<
    ReturnType<typeof getUserSearchResults>
>[number]
export type getUserType = Awaited<ReturnType<typeof getUser>>
export type getUserByEmailType = Awaited<ReturnType<typeof getUserByEmail>>
