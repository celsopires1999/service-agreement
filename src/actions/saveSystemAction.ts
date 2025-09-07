"use server"

import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { CreateSystemUseCase } from "@/core/system/application/use-cases/create-system.use-case"
import { UpdateSystemUseCase } from "@/core/system/application/use-cases/update-system.use-case"
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"
import { db } from "@/db"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import {
    insertSystemSchema,
    type insertSystemSchemaType,
} from "@/zod-schemas/system"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"

export const saveSystemAction = actionClient
    .metadata({ actionName: "saveSystemAction" })
    .schema(insertSystemSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: system,
        }: {
            parsedInput: insertSystemSchemaType
        }) => {
            // New System
            const session = await getSession()

            if (
                session.user.role !== "admin" &&
                session.user.role !== "validator"
            ) {
                throw new ValidationError("Unauthorized")
            }

            const systemRepo = new SystemDrizzleRepository(db)

            if (system.systemId === "" || system.systemId === "(New)") {
                const createSystem = new CreateSystemUseCase(systemRepo)

                const result = await createSystem.execute({
                    name: system.name.trim(),
                    description: system.description.trim(),
                    applicationId: system.applicationId.trim(),
                })

                revalidatePath("/systems")

                return {
                    message: `System ID #${result.systemId} created successfully`,
                    systemId: result.systemId,
                }
            }
            // Existing system
            const updateSystem = new UpdateSystemUseCase(systemRepo)

            await updateSystem.execute({
                systemId: system.systemId,
                name: system.name.trim(),
                description: system.description.trim(),
                applicationId: system.applicationId.trim(),
            })

            revalidatePath("/systems")

            return {
                message: `System ID #${system.systemId} updated successfully`,
                systemId: system.systemId,
            }
        },
    )
