"use server"

import { db } from "@/db"
import { agreements } from "@/db/schema"
import { actionClient } from "@/lib/safe-action"
import { eq } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const deleteAgreementSchema = z.object({
    agreementId: z.string().uuid("invalid UUID"),
})

export type deleteAgreementSchemaType = typeof deleteAgreementSchema._type

export const deleteAgreementAction = actionClient
    .metadata({ actionName: "deleteAgreementAction" })
    .schema(deleteAgreementSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: deleteAgreementSchemaType
        }) => {
            const result = await db
                .delete(agreements)
                .where(eq(agreements.agreementId, params.agreementId))
                .returning({ deletedId: agreements.agreementId })

            revalidatePath(`/agreements/`)

            return {
                message: `Agreement ID #${result[0].deletedId} deleted successfully.`,
            }
        },
    )
