"use server"

import { and, count, eq } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"

import { db } from "@/db"
import { agreements } from "@/db/schema"
import { actionClient } from "@/lib/safe-action"
import {
    insertAgreementSchema,
    type insertAgreementSchemaType,
} from "@/zod-schemas/agreement"
import { revalidatePath } from "next/cache"

export const saveAgreementAction = actionClient
    .metadata({ actionName: "saveAgreementAction" })
    .schema(insertAgreementSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: agreement,
        }: {
            parsedInput: insertAgreementSchemaType
        }) => {
            // New Agreement
            // createdAt and updatedAt are set by the database

            if (
                agreement.agreementId === "" ||
                agreement.agreementId === "(New)"
            ) {
                const result = await db
                    .insert(agreements)
                    .values({
                        year: agreement.year,
                        code: agreement.code.trim(),
                        revision: agreement.revision,
                        isRevised: agreement.isRevised,
                        revisionDate: agreement.revisionDate.trim(),
                        name: agreement.name.trim(),
                        providerPlanId: agreement.providerPlanId,
                        localPlanId: agreement.localPlanId,
                        description: agreement.description.trim(),
                        contactEmail: agreement.contactEmail.trim(),
                        ...(agreement.comment
                            ? { comment: agreement.comment.trim() }
                            : {}),
                    })
                    .returning({ insertedId: agreements.agreementId })

                revalidatePath("/agreements")

                return {
                    message: `Agreement ID #${result[0].insertedId} created successfully`,
                    agreementId: result[0].insertedId,
                }
            }
            // Existing agreement

            const currentAgreement = await db
                .select({
                    agreementId: agreements.agreementId,
                    year: agreements.year,
                    code: agreements.code,
                })
                .from(agreements)
                .where(eq(agreements.agreementId, agreement.agreementId))
                .limit(1)

            const currentAgreementYear = currentAgreement[0].year
            const currentAgreementCode = currentAgreement[0].code

            const countYearCode = await db
                .select({
                    count: count(),
                })
                .from(agreements)
                .where(
                    and(
                        eq(agreements.year, currentAgreementYear),
                        eq(agreements.code, currentAgreementCode),
                    ),
                )

            if (
                countYearCode[0].count > 1 &&
                currentAgreementCode !== agreement.code
            ) {
                throw new Error(
                    `Agreement with year ${currentAgreementYear} and code ${currentAgreementCode} cannot be changed (${countYearCode[0].count} revisions found)`,
                )
            }

            // updatedAt is set by the database
            const result = await db
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
                    contactEmail: agreement.contactEmail.trim(),
                    comment: agreement.comment?.trim() ?? null,
                })
                .where(eq(agreements.agreementId, agreement.agreementId!))
                .returning({ updatedId: agreements.agreementId })

            revalidatePath("/agreements")

            return {
                message: `Agreement ID #${result[0].updatedId} updated successfully`,
                agreementId: result[0].updatedId,
            }
        },
    )
