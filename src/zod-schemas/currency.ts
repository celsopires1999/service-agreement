import { currencies } from "@/db/schema"
import { isGreaterThanZero, isValidDecimalWithPrecision } from "@/lib/utils"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const insertCurrencySchema = createInsertSchema(currencies, {
    year: (schema) =>
        schema.min(2024, "Min year is 2024").max(2125, "Max year is 2155"),
    currency: (schema) =>
        schema.refine((value) => ["EUR", "USD"].includes(value), {
            message: "Invalid currency",
        }),
    value: (schema) =>
        schema
            .refine(
                (value) => {
                    const decimalValue = value.replace(",", ".")
                    return isValidDecimalWithPrecision(decimalValue, 8, 4)
                },
                {
                    message: "Invalid value",
                },
            )
            .refine((value) => isGreaterThanZero(value), {
                message: "Value must be greater than zero",
            })
            .transform((value) => value.replace(",", ".")),
})

export const selectCurrencySchema = createSelectSchema(currencies)

export type insertCurrencySchemaType = typeof insertCurrencySchema._type

export type selectCurrencySchemaType = typeof selectCurrencySchema._type
