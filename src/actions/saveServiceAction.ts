"use server"

import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { CreateServiceUseCase } from "@/core/service/application/use-cases/create-service.use-case"
import { SaveServiceUseCase } from "@/core/service/application/use-cases/save-service.use-case"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { db } from "@/db"
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

                const uow = new UnitOfWorkDrizzle(db, {
                    service: (db) => new ServiceDrizzleRepository(db),
                })

                const uc = new CreateServiceUseCase(uow)
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

            const uow = new UnitOfWorkDrizzle(db, {
                agreement: (db) => new AgreementDrizzleRepository(db),
                service: (db) => new ServiceDrizzleRepository(db),
            })

            const uc = new SaveServiceUseCase(uow)
            const result = await uc.execute(service)

            revalidatePath("/services")

            return {
                message: `Service ID #${result.serviceId} updated successfully`,
                serviceId: result.serviceId,
            }
        },
    )
