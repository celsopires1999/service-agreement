import { Agreement } from "@/core/agreement/domain/agreement"
import { db } from "@/db"
import { agreements } from "@/db/schema"
import { eq } from "drizzle-orm"

export class AgreementDrizzleRepository {
    async findById(agreementId: string): Promise<Agreement | null> {
        const agreementModel = await db.query.agreements.findFirst({
            where: eq(agreements.agreementId, agreementId),
        })

        if (!agreementModel) {
            return null
        }

        return new Agreement({
            ...agreementModel,
        })
    }
}
