"use server"

import { db } from "@/db"
import { services } from "@/db/schema"
import { actionClient } from "@/lib/safe-action"
import { eq } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const deleteServiceSchema = z.object({
    serviceId: z.string().uuid("invalid UUID"),
})

export type deleteServiceSchemaType = typeof deleteServiceSchema._type

export const deleteServiceAction = actionClient
    .metadata({ actionName: "deleteServiceAction" })
    .schema(deleteServiceSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: deleteServiceSchemaType
        }) => {
            const result = await db
                .delete(services)
                .where(eq(services.serviceId, params.serviceId))
                .returning({ deletedId: services.serviceId })

            revalidatePath(`/services/`)

            return {
                message: `Service ID #${result[0].deletedId} deleted successfully.`,
            }
        },
    )
