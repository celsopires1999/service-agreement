import { db } from "@/db"
import { services } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getService(serviceId: string) {
    const service = await db
        .select()
        .from(services)
        .where(eq(services.serviceId, serviceId))
        .limit(1)

    return service[0]
}
