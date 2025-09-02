import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { z } from "zod"
import { Plan } from "./plan"
import { isGreaterThanZero, isValidDecimalWithPrecision } from "@/lib/utils"

export const planSchema = z.object({
    code: z
        .string()
        .min(1, "Code is required")
        .max(20, "Code must be 20 characters or less"),
    description: z
        .string()
        .min(1, "Description is required")
        .max(255, "Description must be 255 characters or less"),
    euro: z.string().refine(
        (value) => {
            const decimalValue = value.replace(",", ".")
            return (
                isValidDecimalWithPrecision(decimalValue, 8, 4) &&
                isGreaterThanZero(value)
            )
        },
        {
            message:
                "Euro must be a valid decimal with up to 4 decimal places and greater than zero",
        },
    ),
    planDate: z.string().date("Plan date is invalid"),
})

export class PlanValidator {
    validate(plan: Plan) {
        const parsed = planSchema.safeParse(plan)

        if (!parsed.success) {
            const fieldErrorsString =
                Object.values(parsed.error.flatten().fieldErrors)
                    .flat()
                    .join(". ") + "."
            throw new ValidationError(fieldErrorsString)
        }
    }
}
