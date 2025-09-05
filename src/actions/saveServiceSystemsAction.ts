"use server"

import { SaveServiceSystemUseCase } from "@/core/service/application/use-cases/save-service-system.use-case"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { db } from "@/db"
import { getSession } from "@/lib/auth"
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
            const session = await getSession()

            if (
                session.user.role !== "admin" &&
                session.user.role !== "validator"
            ) {
                throw new ValidationError("Unauthorized")
            }

            const uow = new UnitOfWorkDrizzle(db, {
                service: (db) => new ServiceDrizzleRepository(db),
            })

            const uc = new SaveServiceSystemUseCase(uow)
            await uc.execute(serviceSystem)

            revalidatePath(`/services/${serviceSystem.serviceId}`)

            return {
                message: `System ID #${serviceSystem.systemId} to Service ID #${serviceSystem.serviceId} saved successfully`,
                serviceId: serviceSystem.systemId,
                systemId: serviceSystem.serviceId,
            }
        },
    )
