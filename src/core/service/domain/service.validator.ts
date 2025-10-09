import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import {
    isGreaterThanOrEqualToZero,
    isValidDecimalWithPrecision,
} from "@/lib/utils"
import { z } from "zod"
import { Service } from "./service"
import { ServiceStatus } from "./service.types"

const serviceSystemsSchema = z.object({
    serviceId: z.string().uuid("Invalid UUID for serviceId in ServiceSystems"),
    systemId: z.string().uuid("Invalid UUID for systemId in ServiceSystems"),
    allocation: z
        .string()
        .refine(
            (value) => {
                const decimalValue = value.replace(",", ".")
                const isValid = isValidDecimalWithPrecision(decimalValue, 9, 6)
                if (!isValid) {
                    return false
                }

                if (+value > 100 || +value < 0.000001) {
                    return false
                }

                return true
            },
            {
                message: "Invalid allocation in ServiceSystems",
            },
        )
        .transform((value) => value.replace(",", ".")),

    amount: z
        .string()
        .refine(
            (value) => {
                const decimalValue = value.replace(",", ".")
                return isValidDecimalWithPrecision(decimalValue, 12, 2)
            },
            {
                message: "Invalid amount in ServiceSystems",
            },
        )
        .transform((value) => value.replace(",", ".")),
    currency: z.string().refine((value) => ["EUR", "USD"].includes(value), {
        message: "Invalid currency in ServiceSystems",
    }),
})

const serviceSchema = z.object({
    serviceId: z.string().uuid("Invalid UUID for serviceId"),
    agreementId: z.string().uuid("Invalid UUID for agreementId"),
    name: z
        .string()
        .min(2, "Name must be between 2 and 255 characters")
        .max(100, "Name must be 100 characters or less"),
    description: z
        .string()
        .min(1, "Description is required")
        .max(500, "Description must be 500 characters or less"),

    runAmount: z
        .string()
        .refine(
            (value) => {
                const decimalValue = value.replace(",", ".")
                return (
                    isValidDecimalWithPrecision(decimalValue, 12, 2) &&
                    isGreaterThanOrEqualToZero(value)
                )
            },
            {
                message:
                    "Run amount must be a valid decimal with up to 2 decimal places and greater than or equal to zero",
            },
        )
        .transform((value) => value.replace(",", ".")),
    chgAmount: z
        .string()
        .refine(
            (value) => {
                const decimalValue = value.replace(",", ".")
                return (
                    isValidDecimalWithPrecision(decimalValue, 12, 2) &&
                    isGreaterThanOrEqualToZero(value)
                )
            },
            {
                message:
                    "Change amount must be a valid decimal with up to 2 decimal places and greater than or equal to zero",
            },
        )
        .transform((value) => value.replace(",", ".")),

    currency: z.string().refine((value) => ["EUR", "USD"].includes(value), {
        message: "Invalid currency",
    }),
    responsibleEmail: z.string().email("Invalid responsible email address"),
    providerAllocation: z
        .string()
        .min(1, "Provider Allocation is required")
        .max(500, "Provider Allocation must be 500 characters or less"),
    localAllocation: z
        .string()
        .min(1, "Local Allocation is required")
        .max(500, "Local Allocation must be 500 characters or less"),
    status: z.nativeEnum(ServiceStatus, {
        errorMap: () => ({ message: "Invalid status" }),
    }),
    validatorEmail: z.string().email("Invalid validator email address"),
    documentUrl: z
        .string()
        .url("Invalid URL")
        .max(300, "Document URL must be 300 characters or less")
        .nullable(),

    serviceSystems: z.array(serviceSystemsSchema).optional(),
})

export class ServiceValidator {
    validate(service: Service) {
        const parsed = serviceSchema.safeParse(service)

        if (!parsed.success) {
            const fieldErrorsString =
                Object.values(parsed.error.flatten().fieldErrors)
                    .flat()
                    .join(". ") + "."
            throw new ValidationError(fieldErrorsString)
        }
    }
}
