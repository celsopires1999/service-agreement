import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { agreements } from "@/db/schema"
import { z } from "zod"

export const insertAgreementSchema = createInsertSchema(agreements, {
    agreementId: z.string(),
    year: (schema) =>
        schema.min(2024, "Min year is 2024").max(2125, "Max year is 2155"),
    revision: (schema) =>
        schema.min(1, "Version is required").max(100, "Max version is 100"),
    revisionDate: (schema) => schema.date("Invalid revision date"),
    name: (schema) =>
        schema
            .min(1, "Name is required")
            .max(100, "Name must be 100 characters or less"),
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
