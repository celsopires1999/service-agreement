import { insertServiceSchemaType } from "@/zod-schemas/service"

export const validatedServicesData: insertServiceSchemaType[] = [
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
        status: "approved",
        validatorEmail: "tbd@tbd.com",
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
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "b5d81465-13d5-4fe6-8e97-5f18ebc6f9ed",
        name: "Central Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description:
            "A premium support package provided by our central team. Includes priority support, regular security updates, and quarterly business reviews",
        runAmount: "200_000.00",
        chgAmount: "100_000.99",
        amount: "300_000.99",
        currency: "EUR" as const,
        responsibleEmail: "8o6tD@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "1d323e0d-1ed8-4183-9fde-d46db6da09b7",
        name: "Additional User Licences",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description:
            "Additional user licenses for our product. Allows more users to access the product and utilize its features",
        runAmount: "300_000.99",
        chgAmount: "100_000.00",
        amount: "400_000.99",
        currency: "EUR" as const,
        responsibleEmail: "john.doe@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "09e5901a-5b14-4e1f-af13-7b0e9d66b3bd",
        name: "Premium Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Premium support package with additional benefits.",
        runAmount: "150_000.00",
        chgAmount: "50_000.99",
        amount: "200_000.99",
        currency: "EUR" as const,
        responsibleEmail: "premium@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "418db53f-be0b-4b68-a59f-aaee11bfd980",
        name: "Standard Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Standard support package with essential features.",
        runAmount: "100_000.00",
        chgAmount: "20_000.99",
        amount: "120_000.99",
        currency: "EUR" as const,
        responsibleEmail: "standard@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "a31316e6-454f-4def-8cd7-4d401e7b8d39",
        name: "Basic Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Basic support package for entry-level assistance.",
        runAmount: "80_000.00",
        chgAmount: "10_000.99",
        amount: "90_000.99",
        currency: "EUR" as const,
        responsibleEmail: "basic@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "81ee4b3d-d88c-48db-9c46-82fc1eb8bd8b",
        name: "Enterprise Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Comprehensive support package for enterprises.",
        runAmount: "300_000.00",
        chgAmount: "150_000.99",
        amount: "450_000.99",
        currency: "EUR" as const,
        responsibleEmail: "enterprise@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "21af436f-ee7b-4112-827b-cfa485ce56b0",
        name: "Corporate Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Advanced support package for corporate clients.",
        runAmount: "250_000.00",
        chgAmount: "100_000.99",
        amount: "350_000.99",
        currency: "EUR" as const,
        responsibleEmail: "corporate@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "d12af29c-2fd9-42d9-b864-a593587792b9",
        name: "Business Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Business support package for small businesses.",
        runAmount: "200_000.00",
        chgAmount: "80_000.99",
        amount: "280_000.99",
        currency: "EUR" as const,
        responsibleEmail: "business@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "d89f9138-3b70-463f-a525-6f7d50a83682",
        name: "Startup Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package tailored for startups.",
        runAmount: "50_000.00",
        chgAmount: "20_000.99",
        amount: "70_000.99",
        currency: "EUR" as const,
        responsibleEmail: "startup@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "4726533b-2f72-4fed-9329-865b5bf48375",
        name: "SME Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for small and medium enterprises.",
        runAmount: "120_000.00",
        chgAmount: "30_000.99",
        amount: "150_000.99",
        currency: "EUR" as const,
        responsibleEmail: "sme@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "a589c58e-92c4-41a4-948a-1e4fc5fb7d95",
        name: "Large Enterprise Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Extensive support package for large enterprises.",
        runAmount: "400_000.00",
        chgAmount: "200_000.99",
        amount: "600_000.99",
        currency: "EUR" as const,
        responsibleEmail: "largeenterprise@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "b73b441a-fe6a-4423-8254-d96a160dcef8",
        name: "Educational Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for educational institutions.",
        runAmount: "90_000.00",
        chgAmount: "30_000.99",
        amount: "120_000.99",
        currency: "EUR" as const,
        responsibleEmail: "education@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "639d9f50-3823-47be-b56e-9f4b087741c7",
        name: "Healthcare Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for healthcare providers.",
        runAmount: "250_000.00",
        chgAmount: "100_000.99",
        amount: "350_000.99",
        currency: "EUR" as const,
        responsibleEmail: "healthcare@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "0e34e39c-f1d3-4b81-bee7-147e98ad6caa",
        name: "Retail Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for retail businesses.",
        runAmount: "180_000.00",
        chgAmount: "70_000.99",
        amount: "250_000.99",
        currency: "EUR" as const,
        responsibleEmail: "retail@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "88bf2993-d0f4-4892-9afe-8fb0f5c95dc8",
        name: "Finance Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for financial institutions.",
        runAmount: "300_000.00",
        chgAmount: "100_000.99",
        amount: "400_000.99",
        currency: "EUR" as const,
        responsibleEmail: "finance@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "7b3b327e-e76c-4323-9637-07e06af430b2",
        name: "Logistics Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for logistics companies.",
        runAmount: "140_000.00",
        chgAmount: "60_000.99",
        amount: "200_000.99",
        currency: "EUR" as const,
        responsibleEmail: "logistics@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "f101e787-fddc-498c-b567-2d9e3b59d1be",
        name: "Technology Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for technology firms.",
        runAmount: "220_000.00",
        chgAmount: "80_000.99",
        amount: "300_000.99",
        currency: "EUR" as const,
        responsibleEmail: "tech@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "9b7b71e9-ff07-46d0-af39-32564b8ec277",
        name: "Non-Profit Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for non-profit organizations.",
        runAmount: "60_000.00",
        chgAmount: "20_000.99",
        amount: "80_000.99",
        currency: "EUR" as const,
        responsibleEmail: "nonprofit@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "0312082f-1df8-4be2-966f-fadcc25444fc",
        name: "Manufacturing Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for manufacturing companies.",
        runAmount: "200_000.00",
        chgAmount: "90_000.99",
        amount: "290_000.99",
        currency: "EUR" as const,
        responsibleEmail: "manufacturing@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "c1abf4ff-7a09-46cb-8ab0-cbc3d070d318",
        name: "Energy Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for energy providers.",
        runAmount: "240_000.00",
        chgAmount: "110_000.99",
        amount: "350_000.99",
        currency: "EUR" as const,
        responsibleEmail: "energy@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "e95f997b-5ca2-40a4-8c69-71cfdbd30491",
        name: "Telecom Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for telecommunications firms.",
        runAmount: "180_000.00",
        chgAmount: "70_000.99",
        amount: "250_000.99",
        currency: "EUR" as const,
        responsibleEmail: "telecom@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "e2589279-0533-4d45-9620-a1dcb4e6bce5",
        name: "Media Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for media companies.",
        runAmount: "160_000.00",
        chgAmount: "60_000.99",
        amount: "220_000.99",
        currency: "EUR" as const,
        responsibleEmail: "media@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "b699d835-0489-4482-87b8-00f2893c8da5",
        name: "Government Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for government agencies.",
        runAmount: "300_000.00",
        chgAmount: "150_000.99",
        amount: "450_000.99",
        currency: "EUR" as const,
        responsibleEmail: "government@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
    {
        serviceId: "4e168386-6098-4519-aad2-6333f2d17ef6",
        name: "Hospitality Support Package",
        agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        description: "Support package for the hospitality industry.",
        runAmount: "180_000.00",
        chgAmount: "80_000.99",
        amount: "260_000.99",
        currency: "EUR" as const,
        responsibleEmail: "hospitality@example.com",
        isActive: false,
        providerAllocation: "Number of users",
        localAllocation: "Number of users",
        status: "approved",
        validatorEmail: "tbd@tbd.com",
    },
]
