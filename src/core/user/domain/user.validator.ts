import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { User } from "./user"
import { z } from "zod"
import { Role } from "./role"

export const userSchema = z.object({
    userId: z.string().uuid("Invalid UUID for userId"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    name: z
        .string()
        .min(1, "Name is required")
        .max(50, "Name must be 50 characters or less"),

    role: z.nativeEnum(Role, {
        errorMap: () => ({ message: "Invalid role" }),
    }),
})

export class UserValidator {
    validate(user: User) {
        const parsed = userSchema.safeParse(user)

        if (!parsed.success) {
            const fieldErrorsString =
                Object.values(parsed.error.flatten().fieldErrors)
                    .flat()
                    .join(". ") + "."
            throw new ValidationError(fieldErrorsString)
        }
    }
}
