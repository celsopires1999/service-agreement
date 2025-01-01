"use server"

import { eq } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"

import { db } from "@/db"
import { systems } from "@/db/schema"
import { actionClient } from "@/lib/safe-action"
import {
    insertSystemSchema,
    type insertSystemSchemaType,
} from "@/zod-schemas/system"
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
            // createdAt and updatedAt are set by the database

            if (system.systemId === "" || system.systemId === "(New)") {
                const result = await db
                    .insert(systems)
                    .values({
                        name: system.name.trim(),
                        description: system.description.trim(),
                        users: system.users,
                        applicationId: system.applicationId.trim(),
                    })
                    .returning({ insertedId: systems.systemId })

                revalidatePath("/systems")

                return {
                    message: `System ID #${result[0].insertedId} created successfully`,
                    systemId: result[0].insertedId,
                }
            }
            // Existing system
            // updatedAt is set by the database
            const result = await db
                .update(systems)
                .set({
                    name: system.name.trim(),
                    description: system.description.trim(),
                    users: system.users,
                    applicationId: system.applicationId.trim(),
                })
                .where(eq(systems.systemId, system.systemId!))
                .returning({ updatedId: systems.systemId })

            revalidatePath("/systems")

            return {
                message: `System ID #${result[0].updatedId} updated successfully`,
                systemId: result[0].updatedId,
            }
        },
    )
