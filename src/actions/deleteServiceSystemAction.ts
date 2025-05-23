"use server"

import { RemoveServiceSystemUseCase } from "@/core/service/application/use-cases/remove-service-system.use-case"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const deleteServiceSystemSchema = z.object({
    serviceId: z.string().uuid("invalid UUID"),
    systemId: z.string().uuid("invalid UUID"),
})

export type deleteServiceSystemSchemaType =
    typeof deleteServiceSystemSchema._type

export const deleteServiceSystemAction = actionClient
    .metadata({ actionName: "deleteServiceSystemAction" })
    .schema(deleteServiceSystemSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: deleteServiceSystemSchemaType
        }) => {
            const session = await getSession()

            if (session.user.role !== "admin") {
                throw new ValidationError("Unauthorized")
            }

            const uc = new RemoveServiceSystemUseCase()
            await uc.execute({
                serviceId: params.serviceId,
                systemId: params.systemId,
            })

            revalidatePath(`/services/${params.serviceId}`)

            return {
                message: `System ID #${params.systemId} deleted successfully from Service ID #${params.serviceId}`,
            }
        },
    )
