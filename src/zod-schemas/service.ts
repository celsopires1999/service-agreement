import { ServiceStatus } from "@/core/service/domain/service"
import { services } from "@/db/schema"
import {
    isGreaterThanOrEqualToZero,
    isValidDecimalWithPrecision,
} from "@/lib/utils"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const insertServiceSchema = createInsertSchema(services, {
    serviceId: z.union([z.string().uuid("invalid UUID"), z.literal("(New)")]),
    agreementId: z.string().uuid("invalid UUID"),
    name: (schema) =>
        schema
            .min(1, "Name is required")
            .max(100, "Name must be 100 characters or less"),
    description: (schema) =>
        schema
            .min(1, "Description is required")
            .max(500, "Description must be 500 characters or less"),

    runAmount: (schema) =>
        schema
            .refine(
                (value) => {
                    const decimalValue = value.replace(",", ".")
                    return isValidDecimalWithPrecision(decimalValue, 12, 2)
                },
                {
                    message: "Invalid run amount",
                },
            )
            .refine((value) => isGreaterThanOrEqualToZero(value), {
                message: "Value must be greater than or equal to zero",
            })
            .transform((value) => value.replace(",", ".")),
    chgAmount: (schema) =>
        schema
            .refine(
                (value) => {
                    const decimalValue = value.replace(",", ".")
                    return isValidDecimalWithPrecision(decimalValue, 12, 2)
                },
                {
                    message: "Invalid change amount",
                },
            )
            .refine((value) => isGreaterThanOrEqualToZero(value), {
                message: "Value must be greater than or equal to zero",
            })
            .transform((value) => value.replace(",", ".")),

    currency: (schema) =>
        schema.refine((value) => ["EUR", "USD"].includes(value), {
            message: "Invalid currency",
        }),
    responsibleEmail: (schema) =>
        schema.email("Invalid responsible email address"),
    providerAllocation: (schema) =>
        schema
            .min(1, "Provider Allocation is required")
            .max(500, "Provider Allocation must be 500 characters or less"),
    localAllocation: (schema) =>
        schema
            .min(1, "Local Allocation is required")
            .max(500, "Local Allocation must be 500 characters or less"),
    status: (schema) =>
        schema.refine((value) => Object.values(ServiceStatus).includes(value), {
            message: "Invalid status",
        }),
    validatorEmail: (schema) => schema.email("Invalid validator email address"),
})

export const selectServiceSchema = createSelectSchema(services)

export type insertServiceSchemaType = typeof insertServiceSchema._type

export type selectServiceSchemaType = typeof selectServiceSchema._type
