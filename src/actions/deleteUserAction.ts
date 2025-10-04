"use server"

import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { DeleteUserUseCase } from "@/core/user/application/use-cases/delete-user.use-case"
import { UserDrizzleRepository } from "@/core/user/infra/db/drizzle/user-drizzle.repository"
import { db } from "@/db"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
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
            const session = await getSession()

            if (session.user.role !== "admin") {
                throw new ValidationError("Unauthorized")
            }

            const userRepo = new UserDrizzleRepository(db)
            const deleteUser = new DeleteUserUseCase(userRepo)
            await deleteUser.execute({
                userId: params.userId,
            })

            // revalidatePath(`/users/`)
            const c = await cookies()
            c.set("force-refresh", JSON.stringify(Math.random()))

            return {
                message: `User ID #${params.userId} deleted successfully.`,
            }
        },
    )
