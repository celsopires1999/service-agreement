import { userListItems, userLists } from "@/db/schema"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const insertUserListSchema = createInsertSchema(userLists, {
    userListId: z.union([z.string().uuid("invalid UUID"), z.literal("(New)")]),
    serviceId: (schema) => schema.uuid("invalid UUID"),
})

export const selectUserListSchema = createSelectSchema(userLists)
export type insertUserListSchemaType = typeof insertUserListSchema._type
export type selectUserListSchemaType = typeof selectUserListSchema._type

export const insertUserListItemSchema = createInsertSchema(userListItems, {
    userListItemId: z.union([
        z.string().uuid("invalid UUID"),
        z.literal("(New)"),
    ]),
    userListId: (schema) => schema.uuid("invalid UUID"),
    name: (schema) =>
        schema
            .min(1, "Name is required")
            .max(50, "Name must be 50 characters or less"),
    email: (schema) => schema.email("Invalid email address"),
    corpUserId: (schema) =>
        schema
            .min(1, "Corp User ID is required")
            .max(8, "Corp User ID must be 8 characters or less"),
    area: (schema) =>
        schema
            .min(1, "Area is required")
            .max(8, "Area must be 8 characters or less"),
    costCenter: (schema) =>
        schema.length(9, "Cost Center must be 9 characters"),
})

export const selectUserListItemSchema = createSelectSchema(userListItems)
export type insertUserListItemSchemaType = typeof insertUserListItemSchema._type
export type selectUserListItemSchemaType = typeof selectUserListItemSchema._type

// UserList Upload
export const userListUploadSchema = z.object({
    serviceId: z.string().uuid("invalid service ID"),
    items: z.array(
        z.object({
            name: z
                .string()
                .min(1, "Name is required")
                .max(50, "Name must be 50 characters or less"),
            email: z.string().email("Invalid email address"),
            corpUserId: z
                .string()
                .min(1, "Corp User ID is required")
                .max(8, "Corp User ID must be 8 characters or less"),
            area: z
                .string()
                .min(1, "Area is required")
                .max(8, "Area must be 8 characters or less"),
            costCenter: z
                .string()
                .length(9, "Cost Center must be 9 characters"),
        }),
    ),
})
export type userListUploadSchemaType = z.infer<typeof userListUploadSchema>
