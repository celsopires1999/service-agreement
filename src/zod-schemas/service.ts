import { services } from "@/db/schema"
import { isValidDecimalWithPrecision } from "@/lib/utils"
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
    amount: (schema) =>
        schema
            .refine(
                (value) => {
                    const decimalValue = value.replace(",", ".")
                    return isValidDecimalWithPrecision(decimalValue, 12, 2)
                },
                {
                    message: "Invalid amount",
                },
            )
            .transform((value) => value.replace(",", ".")),

    currency: (schema) =>
        schema.refine((value) => ["EUR", "USD"].includes(value), {
            message: "Invalid currency",
        }),
    responsibleEmail: (schema) => schema.email("Invalid email address"),
})

export const selectServiceSchema = createSelectSchema(services)

export type insertServiceSchemaType = typeof insertServiceSchema._type

export type selectServiceSchemaType = typeof selectServiceSchema._type
