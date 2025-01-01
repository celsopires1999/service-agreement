"use server"

import { db } from "@/db"
import { serviceSystems } from "@/db/schema"
import { actionClient } from "@/lib/safe-action"
import {
    insertServiceSystemsSchema,
    type insertServiceSystemsSchemaType,
} from "@/zod-schemas/service_systems"
import { and, eq } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"

export const saveServiceSystemsAction = actionClient
    .metadata({ actionName: "saveServiceSystemsAction" })
    .schema(insertServiceSystemsSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: serviceSystem,
        }: {
            parsedInput: insertServiceSystemsSchemaType
        }) => {
            const existingServiceSystem = await db
                .select()
                .from(serviceSystems)
                .where(
                    and(
                        eq(serviceSystems.serviceId, serviceSystem.serviceId),
                        eq(serviceSystems.systemId, serviceSystem.systemId),
                    ),
                )
                .limit(1)

            if (existingServiceSystem.length === 0) {
                const result = await db
                    .insert(serviceSystems)
                    .values({
                        serviceId: serviceSystem.serviceId,
                        systemId: serviceSystem.systemId,
                        allocation: serviceSystem.allocation.trim(),
                        amount: serviceSystem.amount.trim(),
                        currency: serviceSystem.currency,
                    })
                    .returning({
                        insertedServiceId: serviceSystems.serviceId,
                        insertedSystemId: serviceSystems.systemId,
                    })

                revalidatePath("/services")

                return {
                    message: `System ID #${result[0].insertedSystemId} to Service ID #${result[0].insertedServiceId} created successfully`,
                    serviceId: result[0].insertedServiceId,
                    systemId: result[0].insertedSystemId,
                }
            }
            // Existing service
            // updatedAt is set by the database
            const result = await db
                .update(serviceSystems)
                .set({
                    allocation: serviceSystem.allocation.trim(),
                    amount: serviceSystem.amount.trim(),
                    currency: serviceSystem.currency,
                })
                .where(
                    and(
                        eq(serviceSystems.serviceId, serviceSystem.serviceId),
                        eq(serviceSystems.systemId, serviceSystem.systemId),
                    ),
                )
                .returning({
                    updatedServiceId: serviceSystems.serviceId,
                    updatedSystemId: serviceSystems.systemId,
                })

            revalidatePath("/services")

            return {
                message: `System ID #${result[0].updatedSystemId} to Service ID #${result[0].updatedServiceId} updated successfully`,
                serviceId: result[0].updatedServiceId,
                systemId: result[0].updatedSystemId,
            }
        },
    )
