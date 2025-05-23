"use server"

import { DeleteAgreementUseCase } from "@/core/agreement/application/use-cases/delete-agreement.use-case"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
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
            const session = await getSession()

            if (session.user.role !== "admin") {
                throw new ValidationError("Unauthorized")
            }

            const uc = new DeleteAgreementUseCase()
            const result = await uc.execute({
                agreementId: params.agreementId,
            })

            revalidatePath(`/agreements/`)

            return {
                message: `Agreement ID #${result.agreementId} deleted successfully.`,
            }
        },
    )
