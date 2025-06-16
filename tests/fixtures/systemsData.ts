import { insertSystemSchemaType } from "@/zod-schemas/system"

export const systemsData: insertSystemSchemaType[] = [
    {
        systemId: "123e4567-e89b-12d3-a456-426655440000",
        name: "NX",
        description: "Engineering works with NX",
        applicationId: "TAPP-123456",
    },
    {
        systemId: "693ad3fe-9a0c-4fda-b2a2-e00ea771d0bc",
        name: "PLATON",
        description: "PLATON is the new PLM toll for Engineering",
        applicationId: "TAPP-123457",
    },
]
