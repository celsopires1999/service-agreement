import { Role } from "@/core/user/domain/role"
import { users } from "@/db/schema"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const insertUserSchema = createInsertSchema(users, {
    userId: z.union([z.string().uuid("invalid UUID"), z.literal("(New)")]),
    email: (schema) =>
        schema.min(1, "Email is required").email("Invalid email"),
    name: (schema) =>
        schema
            .min(1, "Name is required")
            .max(50, "Name must be 50 characters or less"),
    role: (schema) =>
        schema.refine((value) => Object.values(Role).includes(value), {
            message: "Invalid role",
        }),
})

export const selectUserSchema = createSelectSchema(users)

export type insertUserSchemaType = typeof insertUserSchema._type
export type selectUserSchemaType = typeof selectUserSchema._type
