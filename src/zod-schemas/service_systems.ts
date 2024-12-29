import { serviceSystems } from "@/db/schema"
import { isValidDecimalWithPrecision } from "@/lib/utils"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

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
})

export const selectServiceSystemsSchema = createSelectSchema(serviceSystems)

export type insertServiceSystemsSchemaType =
    typeof insertServiceSystemsSchema._type

export type selectServiceSystemsSchemaType =
    typeof selectServiceSystemsSchema._type
