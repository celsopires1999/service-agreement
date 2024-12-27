"use server"

import { eq } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"

import { db } from "@/db"
import { services } from "@/db/schema"
import { actionClient } from "@/lib/safe-action"
import {
    insertServiceSchema,
    type insertServiceSchemaType,
} from "@/zod-schemas/service"
import { revalidatePath } from "next/cache"

export const saveServiceAction = actionClient
    .metadata({ actionName: "saveServiceAction" })
    .schema(insertServiceSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: service,
        }: {
            parsedInput: insertServiceSchemaType
        }) => {
            // New Service
            // createdAt and updatedAt are set by the database

            if (service.serviceId === "(New)") {
                const result = await db
                    .insert(services)
                    .values({
                        agreementId: service.agreementId,
                        name: service.name.trim(),
                        description: service.description.trim(),
                        amount: service.amount.trim(),
                        currency: service.currency,
                        responsibleEmail: service.responsibleEmail.trim(),
                    })
                    .returning({ insertedId: services.serviceId })

                revalidatePath("/services")

                return {
                    message: `Service ID #${result[0].insertedId} created successfully`,
                }
            }
            // Existing service
            // updatedAt is set by the database
            const result = await db
                .update(services)
                .set({
                    agreementId: service.agreementId,
                    name: service.name.trim(),
                    description: service.description.trim(),
                    amount: service.amount.trim(),
                    currency: service.currency,
                    responsibleEmail: service.responsibleEmail.trim(),
                })
                .where(eq(services.serviceId, service.serviceId!))
                .returning({ updatedId: services.serviceId })

            revalidatePath("/services")

            return {
                message: `Service ID #${result[0].updatedId} updated successfully`,
            }
        },
    )
