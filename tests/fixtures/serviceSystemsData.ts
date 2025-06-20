import { insertServiceSystemsSchemaType } from "@/zod-schemas/service_systems"

export const serviceSystemsData: insertServiceSystemsSchemaType[] = [
    {
        serviceId: "1d323e0d-1ed8-4183-9fde-d46db6da09b7",
        systemId: "123e4567-e89b-12d3-a456-426655440000",
        allocation: "50.00",
        runAmount: "225_000.50",
        chgAmount: "25_000.00",
        amount: "250_000.50",
        currency: "EUR" as const,
    },

    {
        serviceId: "1d323e0d-1ed8-4183-9fde-d46db6da09b7",
        systemId: "693ad3fe-9a0c-4fda-b2a2-e00ea771d0bc",
        allocation: "50.00",
        runAmount: "225_000.50",
        chgAmount: "25_000.00",
        amount: "250_000.50",
        currency: "EUR" as const,
    },
]
