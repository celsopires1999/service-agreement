import { db } from "@/db"
import { agreements } from "@/db/schema"
import { asc, desc, ilike, or, sql } from "drizzle-orm"

export async function getAgreementSearchResults(searchText: string) {
    const results = await db
        .select()
        .from(agreements)
        .where(
            or(
                ilike(agreements.name, `%${searchText}%`),
                ilike(agreements.description, `%${searchText}%`),
                ilike(agreements.contactEmail, `%${searchText}%`),
            ),
        )
        .orderBy(
            asc(agreements.name),
            desc(agreements.year),
            desc(agreements.revision),
        )

    return results
}
