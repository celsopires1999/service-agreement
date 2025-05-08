"use server"

import { DeleteServiceUseCase } from "@/core/service/application/use-cases/delete-service.use-case"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const deleteServiceSchema = z.object({
    serviceId: z.string().uuid("invalid UUID"),
})

export type deleteServiceSchemaType = typeof deleteServiceSchema._type

export const deleteServiceAction = actionClient
    .metadata({ actionName: "deleteServiceAction" })
    .schema(deleteServiceSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: deleteServiceSchemaType
        }) => {
            await getSession()
            const uc = new DeleteServiceUseCase()
            const result = await uc.execute({
                serviceId: params.serviceId,
            })

            revalidatePath(`/services/`)

            return {
                message: `Service ID #${result.serviceId} deleted successfully.`,
            }
        },
    )
