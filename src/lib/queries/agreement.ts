import "server-only"

import { db } from "@/db"
import { agreements, services, serviceSystems } from "@/db/schema"
import { asc, desc, eq, ilike, or } from "drizzle-orm"

export async function getAgreement(agreementId: string) {
    const agreement = await db
        .select()
        .from(agreements)
        .where(eq(agreements.agreementId, agreementId))
        .limit(1)

    return agreement[0]
}

export async function getAgreementSearchResults(searchText: string) {
    return db
        .select()
        .from(agreements)
        .where(
            or(
                ilike(agreements.code, `%${searchText}%`),
                ilike(agreements.name, `%${searchText}%`),
                ilike(agreements.contactEmail, `%${searchText}%`),
            ),
        )
        .orderBy(
            asc(agreements.code),
            desc(agreements.year),
            desc(agreements.revision),
        )
}

export async function getLastYearBySystemId(systemId: string) {
    return db
        .selectDistinct({
            year: agreements.year,
        })
        .from(agreements)
        .innerJoin(services, eq(services.agreementId, agreements.agreementId))
        .innerJoin(
            serviceSystems,
            eq(serviceSystems.serviceId, services.serviceId),
        )
        .where(eq(serviceSystems.systemId, systemId))
        .orderBy(desc(agreements.year))
        .limit(1)
}
