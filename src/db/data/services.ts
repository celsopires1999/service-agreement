import { insertServiceSchemaType } from "@/zod-schemas/service"

export const servicesData: insertServiceSchemaType[] = [
    {
        serviceId: "62f0f1b4-950e-4877-a4e6-82f92fb2f6f0",
        name: "NX Central Support",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support provided by Central Team",
        runAmount: "100_000.00",
        chgAmount: "150_000.99",
        amount: "250_000.99",
        currency: "EUR" as const,
        responsibleEmail: "8o6tD@example.com",
        isActive: true,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
    },
    {
        serviceId: "dedec5ab-a66d-400e-b21a-8a987dffa4a7",
        name: "NX Usage Licences",
        agreementId: "d00ca900-84dc-45d6-97df-42783e657945",
        description: "Share from usage licences",
        runAmount: "450_000.99",
        chgAmount: "50_000.00",
        amount: "500_000.99",
        currency: "EUR" as const,
        responsibleEmail: "john.doe@example.com",
        isActive: true,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
    },
]
