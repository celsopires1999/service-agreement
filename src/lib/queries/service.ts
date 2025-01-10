import "server-only"

import { db } from "@/db"
import { agreements, services, serviceSystems } from "@/db/schema"
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm"

export async function getService(serviceId: string) {
    const service = await db
        .select()
        .from(services)
        .where(eq(services.serviceId, serviceId))
        .limit(1)

    return service[0]
}

export async function countServicesByAgreementId(agreementId: string) {
    const result = await db
        .select({ count: count() })
        .from(services)
        .where(eq(services.agreementId, agreementId))
        .limit(1)

    return result[0].count
}

export async function getServicesBySystemId(systemId: string, year: number) {
    return db
        .select({
            year: agreements.year,
            serviceName: services.name,
            systemAllocation: serviceSystems.allocation,
            systemAmount: serviceSystems.amount,
            systemCurrency: serviceSystems.currency,
            serviceId: services.serviceId,
            serviceAmount: services.amount,
            serviceCurrency: services.currency,
            serviceIsActive: services.isActive,
            agreementId: agreements.agreementId,
            agreementName: agreements.name,
        })
        .from(serviceSystems)
        .innerJoin(services, eq(services.serviceId, serviceSystems.serviceId))
        .innerJoin(agreements, eq(agreements.agreementId, services.agreementId))
        .where(
            and(
                eq(serviceSystems.systemId, systemId),
                eq(agreements.year, year),
            ),
        )
        .orderBy(desc(agreements.year), asc(services.name))
}

export type getServicesBySystemIdType = Awaited<
    ReturnType<typeof getServicesBySystemId>
>[number]

export async function getServiceSearchResults(searchText: string) {
    const results = await db
        .select({
            serviceId: services.serviceId,
            name: services.name,
            amount: services.amount,
            currency: services.currency,
            responsibleEmail: services.responsibleEmail,
            agreementId: services.agreementId,
            agreementCode: agreements.code,
            agreementName: agreements.name,
            year: agreements.year,
            revision: agreements.revision,
            revisionDate: agreements.revisionDate,
            isRevised: agreements.isRevised,
        })
        .from(services)
        .innerJoin(agreements, eq(services.agreementId, agreements.agreementId))
        .where(
            or(
                ilike(services.name, `%${searchText}%`),
                ilike(agreements.code, `%${searchText}%`),
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
>[number]
