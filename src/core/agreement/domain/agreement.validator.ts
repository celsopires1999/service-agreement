import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { z } from "zod"
import { Agreement } from "./agreement"

export const agreementSchema = z.object({
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
    code: z
        .string()
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

    isRevised: z.boolean(),

    revisionDate: z.coerce.date({
        errorMap: (issue, ctx) => {
            if (issue.code === "invalid_date") {
                return { message: "Revision date is invalid" }
            }
            return { message: ctx.defaultError }
        },
    }),

    name: z
        .string()

        .min(1, "Name is required")
        .max(100, "Name must be 100 characters or less"),

    providerPlanId: z.string().uuid("Provider plan is not a valid UUID"),
    localPlanId: z.string().uuid("Local plan is not a valid UUID"),
    description: z
        .string()
        .min(1, "Description is required")
        .max(500, "Description must be 500 characters or less"),
    contactEmail: z.string().email("Invalid email address"),
    comment: z
        .string()
        .max(500, "Comment must be 500 characters or less")
        .nullable(),
    documentUrl: z
        .string()
        .transform((value) => (value === "" ? null : value))
        .pipe(
            z
                .string()
                .url("Invalid URL")
                .max(300, "Document URL must be 300 characters or less")
                .nullable(),
        )
        .nullable(),
})

export class AgreementValidator {
    validate(agreement: Agreement) {
        const parsed = agreementSchema.safeParse(agreement)

        if (!parsed.success) {
            const fieldErrorsString =
                Object.values(parsed.error.flatten().fieldErrors)
                    .flat()
                    .join(". ") + "."
            throw new ValidationError(fieldErrorsString)
        }
    }
}
