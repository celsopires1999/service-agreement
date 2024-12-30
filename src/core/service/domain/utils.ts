import { isValidDecimalWithPrecision } from "@/lib/utils"

export function validateDecimal(
    value: string,
    precision: number,
    scale: number,
) {
    const decimalValue = value.replace(",", ".")
    const isValid = isValidDecimalWithPrecision(decimalValue, precision, scale)
    if (!isValid) {
        return false
    }
    return true
}
