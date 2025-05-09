"use server"

import { db } from "@/db"
import { users } from "@/db/schema"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import { eq } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"
import { cookies } from "next/headers"
import { z } from "zod"

const deleteUserSchema = z.object({
    userId: z.string().uuid("invalid UUID"),
})

export type deleteUserSchemaType = typeof deleteUserSchema._type

export const deleteUserAction = actionClient
    .metadata({ actionName: "deleteUserAction" })
    .schema(deleteUserSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: deleteUserSchemaType
        }) => {
            await getSession()

            const result = await db
                .delete(users)
                .where(eq(users.userId, params.userId))
                .returning({ deletedId: users.userId })

            // revalidatePath(`/users/`)
            const c = await cookies()
            c.set("force-refresh", JSON.stringify(Math.random()))

            return {
                message: `User ID #${result[0].deletedId} deleted successfully.`,
            }
        },
    )
