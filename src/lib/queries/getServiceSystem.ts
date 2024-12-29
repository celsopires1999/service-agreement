import { db } from "@/db"
import { serviceSystems } from "@/db/schema"
import { and, eq } from "drizzle-orm"

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
