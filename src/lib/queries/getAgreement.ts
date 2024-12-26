import { db } from "@/db"
import { agreements } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getAgreement(agreementId: string) {
    const agreement = await db
        .select()
        .from(agreements)
        .where(eq(agreements.agreementId, agreementId))
        .limit(1)

    return agreement[0]
}
