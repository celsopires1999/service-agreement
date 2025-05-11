"use server"

import { CreateServiceUseCase } from "@/core/service/application/use-cases/create-service.use-case"
import { SaveServiceUseCase } from "@/core/service/application/use-cases/save-service.use-case"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import {
    insertServiceSchema,
    type insertServiceSchemaType,
} from "@/zod-schemas/service"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"

export const saveServiceAction = actionClient
    .metadata({ actionName: "saveServiceAction" })
    .schema(insertServiceSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: service,
        }: {
            parsedInput: insertServiceSchemaType
        }) => {
            // New Service
            // createdAt and updatedAt are set by the database

            const session = await getSession()

            if (service.serviceId === "(New)") {
                if (session.user.role !== "admin") {
                    throw new ValidationError(
                        "You are not authorized to create a new service",
                    )
                }

                const uc = new CreateServiceUseCase()
                const result = await uc.execute(service)

                revalidatePath("/services")

                return {
                    message: `Service ID #${result.serviceId} created successfully`,
                    serviceId: result.serviceId,
                }
            }

            // Existing service
            if (session.user.role !== "admin") {
                if (session.user.role !== "validator") {
                    throw new ValidationError("Unauthorized")
                }
                if (service.validatorEmail !== session.user.email) {
                    throw new ValidationError(
                        "Not authorized because you are not the validator of this service",
                    )
                }
            }

            const uc = new SaveServiceUseCase()
            const result = await uc.execute(service)

            revalidatePath("/services")

            return {
                message: `Service ID #${result.serviceId} updated successfully`,
                serviceId: result.serviceId,
            }
        },
    )
