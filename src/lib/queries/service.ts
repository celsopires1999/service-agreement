import { db } from "@/db"
import { agreements, services, serviceSystems } from "@/db/schema"
import { asc, count, desc, eq, and } from "drizzle-orm"

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
