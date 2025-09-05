import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { z } from "zod"
import { UserList } from "./user-list"

export const userListItemSchema = z.object({
    userListItemId: z.string().uuid("Invalid UUID for userListItemId"),
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
        .max(15, "Area must be 15 characters or less"),
    costCenter: z.string().length(9, "Cost Center must be 9 characters"),
})

export const userListSchema = z.object({
    userListId: z.string().uuid("Invalid UUID for userListId"),
    serviceId: z.string().uuid("Invalid UUID for serviceId"),
    usersNumber: z.number().min(1, "User number must be at least 1"),
    items: z.array(userListItemSchema).min(1, "At least one user is required"),
})

export class UserListValidator {
    validate(userList: UserList) {
        const parsed = userListSchema.safeParse(userList)

        if (!parsed.success) {
            const fieldErrorsString =
                Object.values(parsed.error.flatten().fieldErrors)
                    .flat()
                    .join(". ") + "."
            throw new ValidationError(fieldErrorsString)
        }
    }
}
