import { plans } from "@/db/schema"
import { isGreaterThanZero, isValidDecimalWithPrecision } from "@/lib/utils"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const insertPlanSchema = createInsertSchema(plans, {
    planId: z.union([z.string().uuid("invalid UUID"), z.literal("(New)")]),
    code: (schema) =>
        schema
            .min(1, "Code is required")
            .max(20, "Code must be 20 characters or less"),
    description: (schema) =>
        schema
            .min(1, "Description is required")
            .max(50, "Description must be 50 characters or less"),
    euro: (schema) =>
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
    planDate: (schema) => schema.date("Invalid plan date"),
})

export const selectPlanSchema = createSelectSchema(plans)

export type insertPlanSchemaType = typeof insertPlanSchema._type

export type selectPlanSchemaType = typeof selectPlanSchema._type
