import { insertUserSchemaType } from "@/zod-schemas/user"

export const usersData: insertUserSchemaType[] = [
    {
        userId: "5f557471-bb62-4f80-bf77-5fac93dc0e1f",
        email: "admin@admin.com",
        name: "Admin User",
        role: "admin",
    },
    {
        userId: "3d62bf32-3597-4bd1-8ef1-b89a7cf7cc9e",
        email: "viewer@viewer.com",
        name: "Viewer User",
        role: "viewer",
    },
    {
        userId: "0dcac741-0c9b-41f9-80cc-ac972af02819",
        email: "validator@validator.com",
        name: "Validator User",
        role: "validator",
    },
]
