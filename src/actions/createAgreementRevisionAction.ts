"use server"

import { CreateAgreementRevisionUseCase } from "@/core/agreement/application/use-cases/create-agreement-revision.use-case"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import {
    createAgreementRevisionSchema,
    createAgreementRevisionSchemaType,
} from "@/zod-schemas/agreement"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"

export const createAgreementRevisionAction = actionClient
    .metadata({ actionName: "createAgreementRevisionAction" })
    .schema(createAgreementRevisionSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: createAgreementRevisionSchemaType
        }) => {
            const session = await getSession()

            if (session.user.role !== "admin") {
                throw new ValidationError("Unauthorized")
            }

            const uc = new CreateAgreementRevisionUseCase()

            const result = await uc.execute({
                agreementId: params.agreementId,
                revisionDate: params.revisionDate,
                providerPlanId: params.providerPlanId,
                localPlanId: params.localPlanId,
            })

            revalidatePath(`/agreements/${params.agreementId}`)

            return {
                message: `Agreement ID #${result.agreementId} created successfully.`,
                agreementId: result.agreementId,
            }
        },
    )
