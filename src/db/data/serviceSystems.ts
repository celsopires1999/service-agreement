import { insertServiceSystemsSchemaType } from "@/zod-schemas/service_systems"

export const serviceSystemsData: insertServiceSystemsSchemaType[] = [
    {
        serviceId: "62f0f1b4-950e-4877-a4e6-82f92fb2f6f0",
        systemId: "123e4567-e89b-12d3-a456-426655440000",
        allocation: "100.00",
        amount: "250_000.99",
        currency: "EUR" as const,
    },

    {
        serviceId: "dedec5ab-a66d-400e-b21a-8a987dffa4a7",
        systemId: "123e4567-e89b-12d3-a456-426655440000",
        allocation: "100.00",
        amount: "500_000.99",
        currency: "EUR" as const,
    },
]
