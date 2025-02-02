import { systems } from "@/db/schema"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const insertSystemSchema = createInsertSchema(systems, {
    systemId: z.union([z.string().uuid("invalid UUID"), z.literal("(New)")]),
    name: (schema) =>
        schema
            .min(1, "Name is required")
            .max(50, "Name must be 50 characters or less"),
    description: (schema) =>
        schema
            .min(1, "Description is required")
            .max(500, "Description must be 500 characters or less"),
    applicationId: (schema) =>
        schema
            .min(1, "Application ID is required")
            .max(20, "Application ID must be 20 characters or less"),
})

export const selectSystemSchema = createSelectSchema(systems)

export type insertSystemSchemaType = typeof insertSystemSchema._type

export type selectSystemSchemaType = typeof selectSystemSchema._type
