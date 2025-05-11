"use server"

import { eq } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"

import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { db } from "@/db"
import { users } from "@/db/schema"
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
            // New User
            // createdAt and updatedAt are set by the database
            const session = await getSession()

            if (session.user.role !== "admin") {
                throw new ValidationError("Unauthorized")
            }

            if (user.userId === "" || user.userId === "(New)") {
                const result = await db
                    .insert(users)
                    .values({
                        name: user.name.trim(),
                        email: user.email.trim().toLowerCase(),
                        role: user.role,
                    })
                    .returning({ insertedId: users.userId })

                // revalidatePath("/users")
                const c = await cookies()
                c.set("force-refresh", JSON.stringify(Math.random()))

                return {
                    message: `User ID #${result[0].insertedId} created successfully`,
                    userId: result[0].insertedId,
                }
            }
            // Existing user
            // updatedAt is set by the database
            const result = await db
                .update(users)
                .set({
                    name: user.name.trim(),
                    email: user.email.trim().toLowerCase(),
                    role: user.role,
                })
                .where(eq(users.userId, user.userId!))
                .returning({ updatedId: users.userId })

            // revalidatePath("/users")
            const c = await cookies()
            c.set("force-refresh", JSON.stringify(Math.random()))

            return {
                message: `User ID #${result[0].updatedId} updated successfully`,
                userId: result[0].updatedId,
            }
        },
    )
