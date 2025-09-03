import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Decimal } from "decimal.js"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function isValidDecimalWithPrecision(
    input: string,
    precision: number,
    scale: number,
): boolean {
    try {
        const decimal = new Decimal(input)

        // Check if the input has the specified precision and scale
        const [integerPart, fractionalPart] = decimal.toFixed().split(".")

        if (integerPart.length > precision - scale) {
            return false
        }

        if (fractionalPart && fractionalPart.length > scale) {
            return false
        }

        return true
    } catch (error) /* eslint-disable-line  @typescript-eslint/no-unused-vars */ {
        return false
    }
}

export function isGreaterThanZero(value: string) {
    try {
        const valueDecimal = new Decimal(value)
        return valueDecimal.gt(0)
    } catch (error) /* eslint-disable-line  @typescript-eslint/no-unused-vars */ {
        return false
    }
}

export function isGreaterThanOrEqualToZero(value: string) {
    try {
        const valueDecimal = new Decimal(value)
        return valueDecimal.gte(0)
    } catch (error) /* eslint-disable-line  @typescript-eslint/no-unused-vars */ {
        return false
    }
}

export function toDecimal(value: string) {
    try {
        const valueDecimal = new Decimal(value)
        return valueDecimal
    } catch (error) /* eslint-disable-line  @typescript-eslint/no-unused-vars */ {
        return new Decimal(0)
    }
}

export function compareDecimal(left: string, right: string): number {
    const leftDecimal = toDecimal(left)
    const rightDecimal = toDecimal(right)
    return leftDecimal.comparedTo(rightDecimal)
}

export function dateFormatter(value: unknown): string {
    if (typeof value !== "string") return ""

    return value
        ? new Intl.DateTimeFormat("pt-BR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
          }).format(
              new Date(
                  +value.substring(0, 4),
                  +value.substring(5, 7) - 1,
                  +value.substring(8, 10),
              ),
          )
        : ""
}

export function amountFormatter(value: unknown): string {
    if (typeof value !== "string" && typeof value !== "number") return ""

    return new Intl.NumberFormat("pt-BR", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(+value)
}

export function validatorEmailFormatter(value: unknown): string {
    if (typeof value !== "string") {
        return ""
    }

    return value?.split("@")[0]
}
