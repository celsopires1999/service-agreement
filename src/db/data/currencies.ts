import { insertCurrencySchemaType } from "@/zod-schemas/currency"

export const currenciesData: insertCurrencySchemaType[] = [
    {
        year: 2024,
        currency: "EUR" as const,
        value: "1.2345",
    },
    {
        year: 2024,
        currency: "USD" as const,
        value: "1.0",
    },
    {
        year: 2025,
        currency: "EUR" as const,
        value: "1.2345",
    },
    {
        year: 2025,
        currency: "USD" as const,
        value: "1.0",
    },
]
