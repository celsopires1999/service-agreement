import { Agreement } from "@/core/agreement/domain/agreement"
import { AgreementRepository } from "@/core/agreement/domain/agreement.repository"
import { DB } from "@/db"
import { agreements } from "@/db/schema"
import { and, count, eq } from "drizzle-orm"

export class AgreementDrizzleRepository implements AgreementRepository {
    constructor(private readonly db: DB) {}

    async insert(agreement: Agreement): Promise<void> {
        await this.db.insert(agreements).values({
            agreementId: agreement.agreementId,
            year: agreement.year,
            code: agreement.code.trim(),
            revision: agreement.revision,
            isRevised: agreement.isRevised,
            revisionDate: agreement.revisionDate.trim(),
            name: agreement.name.trim(),
            providerPlanId: agreement.providerPlanId,
            localPlanId: agreement.localPlanId,
            description: agreement.description.trim(),
            contactEmail: agreement.contactEmail.trim().toLocaleLowerCase(),
            ...(agreement.comment ? { comment: agreement.comment.trim() } : {}),
            ...(agreement.documentUrl
                ? { documentUrl: agreement.documentUrl.trim() }
                : {}),
        })
    }

    async update(agreement: Agreement): Promise<void> {
        await this.db
            .update(agreements)
            .set({
                year: agreement.year,
                code: agreement.code.trim(),
                revision: agreement.revision,
                isRevised: agreement.isRevised,
                revisionDate: agreement.revisionDate.trim(),
                name: agreement.name.trim(),
                providerPlanId: agreement.providerPlanId,
                localPlanId: agreement.localPlanId,
                description: agreement.description.trim(),
                contactEmail: agreement.contactEmail.trim().toLocaleLowerCase(),
                comment: agreement.comment?.trim() ?? null,
                documentUrl: agreement.documentUrl?.trim() ?? null,
            })
            .where(eq(agreements.agreementId, agreement.agreementId!))
    }

    async delete(agreementId: string): Promise<void> {
        await this.db
            .delete(agreements)
            .where(eq(agreements.agreementId, agreementId))
    }

    async find(agreementId: string): Promise<Agreement | null> {
        const agreementModel = await this.db.query.agreements.findFirst({
            where: eq(agreements.agreementId, agreementId),
        })

        if (!agreementModel) {
            return null
        }

        return new Agreement({
            ...agreementModel,
        })
    }

    async countRevisions(year: number, code: string): Promise<number> {
        const revisions = await this.db
            .select({
                count: count(),
            })
            .from(agreements)
            .where(and(eq(agreements.year, year), eq(agreements.code, code)))

        return revisions[0].count
    }
}
