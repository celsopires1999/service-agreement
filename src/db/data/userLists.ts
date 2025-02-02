import {
    insertUserListItemSchemaType,
    insertUserListSchemaType,
} from "@/zod-schemas/user-list"

export const userListsData: insertUserListSchemaType[] = [
    {
        userListId: "0a520058-960d-4be3-b34d-6048780bd3dc",
        serviceId: "62f0f1b4-950e-4877-a4e6-82f92fb2f6f0",
        usersNumber: 2,
    },
]

export const userListItemsData: insertUserListItemSchemaType[] = [
    {
        userListItemId: "6694a4bf-a38c-4f46-bd6b-a0bac3018de4",
        userListId: "0a520058-960d-4be3-b34d-6048780bd3dc",
        name: "John Doe",
        email: "john.doe@userland.com",
        corpUserId: "JOHNDOE",
        area: "TT/I-A",
        costCenter: "5540-1114",
    },
    {
        userListItemId: "0fc90b4e-e446-4ed1-99c7-1c81a9825267",
        userListId: "0a520058-960d-4be3-b34d-6048780bd3dc",
        name: "Mary Doe",
        email: "mary.doe@userland.com",
        corpUserId: "MARYDOE",
        area: "TT/I-A",
        costCenter: "5540-1114",
    },
]
