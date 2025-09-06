"use server"

import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { DeleteSystemUseCase } from "@/core/system/application/use-cases/delete-system.use-case"
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"
import { db } from "@/db"
import { systems } from "@/db/schema"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import { eq } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const deleteSystemSchema = z.object({
    systemId: z.string().uuid("invalid UUID"),
})

export type deleteSystemSchemaType = typeof deleteSystemSchema._type

export const deleteSystemAction = actionClient
    .metadata({ actionName: "deleteSystemAction" })
    .schema(deleteSystemSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: deleteSystemSchemaType
        }) => {
            await getSession()

            const session = await getSession()

            if (
                session.user.role !== "admin" &&
                session.user.role !== "validator"
            ) {
                throw new ValidationError("Unauthorized")
            }

            const deleteSystem = new DeleteSystemUseCase(
                new SystemDrizzleRepository(db),
            )
            await deleteSystem.execute({ systemId: params.systemId })

            revalidatePath(`/systems/`)

            return {
                message: `System ID #${params.systemId} deleted successfully.`,
            }
        },
    )
