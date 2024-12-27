import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { services } from "@/db/schema"
import { z } from "zod"
import { isValidDecimalWithPrecision } from "@/lib/utils"

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
        schema.refine(
            (value) => {
                return isValidDecimalWithPrecision(value, 12, 2)
            },
            {
                message: "Invalid amount",
            },
        ),
    currency: (schema) =>
        schema.refine((value) => ["EUR", "USD"].includes(value), {
            message: "Invalid currency",
        }),
    responsibleEmail: (schema) => schema.email("Invalid email address"),
})

export const selectServiceSchema = createSelectSchema(services)

export type insertServiceSchemaType = typeof insertServiceSchema._type

export type selectServiceSchemaType = typeof selectServiceSchema._type
