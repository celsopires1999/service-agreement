import { serviceSystems } from "@/db/schema"
import { isValidDecimalWithPrecision } from "@/lib/utils"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const insertServiceSystemsSchema = createInsertSchema(serviceSystems, {
    serviceId: (schema) => schema.uuid("invalid UUID"),
    systemId: (schema) => schema.uuid("invalid UUID"),
    allocation: (schema) =>
        schema
            .refine(
                (value) => {
                    const decimalValue = value.replace(",", ".")
                    const isValid = isValidDecimalWithPrecision(
                        decimalValue,
                        5,
                        2,
                    )
                    if (!isValid) {
                        return false
                    }

                    if (+value > 100 || +value < 0.01) {
                        return false
                    }

                    return true
                },
                {
                    message: "Invalid allocation",
                },
            )
            .transform((value) => value.replace(",", ".")),

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
})

export const selectServiceSystemsSchema = createSelectSchema(serviceSystems)

export type insertServiceSystemsSchemaType =
    typeof insertServiceSystemsSchema._type

export type selectServiceSystemsSchemaType =
    typeof selectServiceSystemsSchema._type

export const saveServiceSystemsSchema = z.object({
    serviceId: z.string().uuid("invalid UUID"),
    systemId: z.string().uuid("invalid UUID"),
    allocation: z
        .string()
        .refine(
            (value) => {
                const decimalValue = value.replace(",", ".")
                const isValid = isValidDecimalWithPrecision(decimalValue, 5, 2)
                if (!isValid) {
                    return false
                }

                if (+value > 100 || +value < 0.0) {
                    return false
                }

                return true
            },
            {
                message: "Invalid allocation",
            },
        )
        .transform((value) => value.replace(",", ".")),
})

export type saveServiceSystemsSchemaType = typeof saveServiceSystemsSchema._type
