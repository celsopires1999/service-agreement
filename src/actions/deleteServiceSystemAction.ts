"use server"

import { db } from "@/db"
import { serviceSystems } from "@/db/schema"
import { actionClient } from "@/lib/safe-action"
import { and, eq } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const deleteServiceSystemSchema = z.object({
    serviceId: z.string().uuid("invalid UUID"),
    systemId: z.string().uuid("invalid UUID"),
})

type deleteServiceSystemSchemaType = typeof deleteServiceSystemSchema._type

export const deleteServiceSystemAction = actionClient
    .metadata({ actionName: "deleteServiceSystemAction" })
    .schema(deleteServiceSystemSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: deleteServiceSystemSchemaType
        }) => {
            const result = await db
                .delete(serviceSystems)
                .where(
                    and(
                        eq(serviceSystems.serviceId, params.serviceId),
                        eq(serviceSystems.systemId, params.systemId),
                    ),
                )
                .returning({
                    deletedServiceId: serviceSystems.serviceId,
                    deletedSystemId: serviceSystems.systemId,
                })

            revalidatePath(`/services/${params.serviceId}`)

            if (result.length === 0) {
                throw new Error(
                    `System ID #${params.systemId} for Service ID #${params.serviceId} not found`,
                )
            }

            return {
                message: `System ID #${result[0].deletedSystemId} deleted successfully from Service ID #${result[0].deletedServiceId}`,
            }
        },
    )
