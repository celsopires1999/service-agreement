"use server"

import { flattenValidationErrors } from "next-safe-action"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { CreateUserUseCase } from "@/core/user/application/use-cases/create-user.use-case"
import { UpdateUserUseCase } from "@/core/user/application/use-cases/update-user.use-case"
import { UserDrizzleRepository } from "@/core/user/infra/db/drizzle/user-drizzle.repository"
import { db } from "@/db"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import { insertUserSchema, type insertUserSchemaType } from "@/zod-schemas/user"
import { cookies } from "next/headers"

export const saveUserAction = actionClient
    .metadata({ actionName: "saveUserAction" })
    .schema(insertUserSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: user,
        }: {
            parsedInput: insertUserSchemaType
        }) => {
            const session = await getSession()

            if (session.user.role !== "admin") {
                throw new ValidationError("Unauthorized")
            }

            const userRepo = new UserDrizzleRepository(db)

            if (user.userId === "" || user.userId === "(New)") {
                // New User
                const createUser = new CreateUserUseCase(userRepo)
                const result = await createUser.execute({
                    name: user.name.trim(),
                    email: user.email.trim().toLowerCase(),
                    role: user.role,
                })

                // revalidatePath("/users")
                const c = await cookies()
                c.set("force-refresh", JSON.stringify(Math.random()))

                return {
                    message: `User ID #${result.userId} created successfully`,
                    userId: result.userId,
                }
            }
            // Existing user
            const updateUser = new UpdateUserUseCase(userRepo)
            await updateUser.execute({
                userId: user.userId,
                name: user.name.trim(),
                email: user.email.trim().toLowerCase(),
                role: user.role,
            })
            // revalidatePath("/users")
            const c = await cookies()
            c.set("force-refresh", JSON.stringify(Math.random()))

            return {
                message: `User ID #${user.userId} updated successfully`,
                userId: user.userId,
            }
        },
    )
