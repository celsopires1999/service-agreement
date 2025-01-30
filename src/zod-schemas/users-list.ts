import { usersListItems, usersLists } from "@/db/schema"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const insertUsersListSchema = createInsertSchema(usersLists, {
    usersListId: z.union([z.string().uuid("invalid UUID"), z.literal("(New)")]),
    systemId: (schema) => schema.uuid("invalid UUID"),
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
    localPlanId: z.string().uuid("invalid UUID"),
    usersNumber: z
        .union([z.number(), z.string()])
        .refine(
            (value) => {
                if (typeof value === "number") {
                    return value <= 99999
                } else if (typeof value === "string") {
                    return parseInt(value) <= 99999
                }
            },
            {
                message: "Users must be 99999 or less",
            },
        )
        .transform((value) => {
            if (typeof value === "string") {
                return parseInt(value)
            }
            return value
        }),
})

export const selectUsersListSchema = createSelectSchema(usersLists)
export type insertUsersListSchemaType = typeof insertUsersListItemSchema._type
export type selectUsersListSchemaType = typeof selectUsersListSchema._type

export const insertUsersListItemSchema = createInsertSchema(usersListItems, {
    usersListItemId: z.union([
        z.string().uuid("invalid UUID"),
        z.literal("(New)"),
    ]),
    usersListId: (schema) => schema.uuid("invalid UUID"),
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

export const selectUsersListItemSchema = createSelectSchema(usersListItems)
export type insertUsersListItemType = typeof insertUsersListItemSchema._type
export type selectUsersListItemSchemaType =
    typeof selectUsersListItemSchema._type
