import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { z } from "zod"
import { System } from "./system"

const systemSchema = z.object({
    systemId: z.union([z.string().uuid("invalid UUID"), z.literal("(New)")]),
    name: z
        .string()
        .min(1, "Name is required")
        .max(50, "Name must be 50 characters or less"),
    description: z
        .string()
        .min(1, "Description is required")
        .max(500, "Description must be 500 characters or less"),
    applicationId: z
        .string()
        .min(1, "Application ID is required")
        .max(20, "Application ID must be 20 characters or less"),
})

export class SystemValidator {
    validate(system: System) {
        const parsed = systemSchema.safeParse(system)

        if (!parsed.success) {
            const fieldErrorsString =
                Object.values(parsed.error.flatten().fieldErrors)
                    .flat()
                    .join(". ") + "."
            throw new ValidationError(fieldErrorsString)
        }
    }
}
