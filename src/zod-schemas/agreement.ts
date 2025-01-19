import { agreements } from "@/db/schema"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const insertAgreementSchema = createInsertSchema(agreements, {
    agreementId: z.string(),
    year: z
        .union([z.number(), z.string()])
        .refine(
            (value) => {
                let year: number

                if (typeof value === "string") {
                    year = parseInt(value)

                    if (isNaN(year)) {
                        return false
                    }
                } else {
                    year = value
                }

                if (year < 2024 || year > 2125) {
                    return false
                }

                return true
            },
            {
                message: "Year must be a number between 2024 and 2125",
            },
        )
        .transform((value) => {
            if (typeof value === "string") {
                return parseInt(value)
            }
            return value
        }),
    code: (schema) =>
        schema
            .min(1, "Code is required")
            .max(20, "Code must be 20 characters or less"),

    revision: z
        .union([z.number(), z.string()])
        .refine(
            (value) => {
                let revision: number

                if (typeof value === "string") {
                    revision = parseInt(value)
                    if (isNaN(revision)) {
                        return false
                    }
                } else {
                    revision = value
                }

                if (revision < 1 || revision > 100) {
                    return false
                }

                return true
            },
            {
                message: "Revision must be a number between 1 and 100",
            },
        )
        .transform((value) => {
            if (typeof value === "string") {
                return parseInt(value)
            }
            return value
        }),
    revisionDate: (schema) => schema.date("Invalid revision date"),
    name: (schema) =>
        schema
            .min(1, "Name is required")
            .max(100, "Name must be 100 characters or less"),

    providerPlanId: z.string().uuid("invalid UUID"),
    localPlanId: z.string().uuid("invalid UUID"),
    description: (schema) =>
        schema
            .min(1, "Description is required")
            .max(500, "Description must be 500 characters or less"),
    contactEmail: (schema) => schema.email("Invalid email address"),
    comment: (schema) =>
        schema.max(500, "Comment must be 500 characters or less"),
})

export const selectAgreementSchema = createSelectSchema(agreements)

export type insertAgreementSchemaType = typeof insertAgreementSchema._type

export type selectAgreementSchemaType = typeof selectAgreementSchema._type

export const createAgreementRevisionSchema = z.object({
    agreementId: z.string().uuid("invalid UUID"),
    revisionDate: z.string().date("Invalid revision date"),
    providerPlanId: z.string().uuid("provider plan is invalid"),
    localPlanId: z.string().uuid("local plan is invalid"),
})

export type createAgreementRevisionSchemaType =
    typeof createAgreementRevisionSchema._type
