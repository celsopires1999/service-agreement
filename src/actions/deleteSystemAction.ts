"use server"

import { ValidationError } from "@/core/shared/domain/validators/validation.error"
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

            const result = await db
                .delete(systems)
                .where(eq(systems.systemId, params.systemId))
                .returning({ deletedId: systems.systemId })

            revalidatePath(`/systems/`)

            return {
                message: `System ID #${result[0].deletedId} deleted successfully.`,
            }
        },
    )
