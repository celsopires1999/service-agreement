import "server-only"

import { db } from "@/db"
import { serviceSystems, systems } from "@/db/schema"
import { and, asc, eq } from "drizzle-orm"

export async function getServiceSystemsSearchResults(serviceId: string) {
    const result = await db
        .select({
            serviceId: serviceSystems.serviceId,
            systemId: serviceSystems.systemId,
            name: systems.name,
            description: systems.description,
            allocation: serviceSystems.allocation,
            amount: serviceSystems.amount,
            currency: serviceSystems.currency,
        })
        .from(serviceSystems)
        .innerJoin(systems, eq(systems.systemId, serviceSystems.systemId))
        .where(eq(serviceSystems.serviceId, serviceId))
        .orderBy(asc(systems.name))

    return result
}

export type getServiceSystemsSearchResultsType = Awaited<
    ReturnType<typeof getServiceSystemsSearchResults>
>[number]

export async function getServiceSystem(serviceId: string, systemId: string) {
    const serviceSystem = await db
        .select()
        .from(serviceSystems)
        .where(
            and(
                eq(serviceSystems.systemId, systemId),
                eq(serviceSystems.serviceId, serviceId),
            ),
        )
        .limit(1)

    return serviceSystem[0]
}
