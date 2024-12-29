import { db } from "@/db"
import { agreements, services } from "@/db/schema"
import { asc, ilike, or, eq, desc } from "drizzle-orm"

export async function getServiceSearchResults(searchText: string) {
    const results = await db
        .select({
            serviceId: services.serviceId,
            name: services.name,
            amount: services.amount,
            currency: services.currency,
            responsibleEmail: services.responsibleEmail,
            agreementId: services.agreementId,
            agreementName: agreements.name,
            year: agreements.year,
            revision: agreements.revision,
            revisionDate: agreements.revisionDate,
        })
        .from(services)
        .innerJoin(agreements, eq(services.agreementId, agreements.agreementId))
        .where(
            or(
                ilike(services.name, `%${searchText}%`),
                ilike(services.description, `%${searchText}%`),
                ilike(services.responsibleEmail, `%${searchText}%`),
                ilike(agreements.name, `%${searchText}%`),
            ),
        )
        .orderBy(
            asc(services.name),
            desc(agreements.year),
            desc(agreements.revision),
        )

    return results
}

export type getServiceSearchResultsType = Awaited<
    ReturnType<typeof getServiceSearchResults>
>[0]
