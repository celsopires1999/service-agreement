"use server"

import { SaveServiceSystemUseCase } from "@/core/service/application/use-cases/save-service-system.use-case"
import { actionClient } from "@/lib/safe-action"
import {
    saveServiceSystemsSchema,
    saveServiceSystemsSchemaType,
} from "@/zod-schemas/service_systems"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"

export const saveServiceSystemsAction = actionClient
    .metadata({ actionName: "saveServiceSystemsAction" })
    .schema(saveServiceSystemsSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: serviceSystem,
        }: {
            parsedInput: saveServiceSystemsSchemaType
        }) => {
            const uc = new SaveServiceSystemUseCase()
            await uc.execute(serviceSystem)

            revalidatePath(`/services/${serviceSystem.serviceId}`)

            return {
                message: `System ID #${serviceSystem.systemId} to Service ID #${serviceSystem.serviceId} saved successfully`,
                serviceId: serviceSystem.systemId,
                systemId: serviceSystem.serviceId,
            }
        },
    )
