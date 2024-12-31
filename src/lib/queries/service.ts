import { db } from "@/db"
import { services } from "@/db/schema"
import { eq, count } from "drizzle-orm"

export async function countServicesByAgreementId(agreementId: string) {
    const result = await db
        .select({ count: count() })
        .from(services)
        .where(eq(services.agreementId, agreementId))
        .limit(1)

    return result[0].count
}
