"use server"

import { SaveUserListUseCase } from "@/core/users-list/application/use-cases/save-user-list.use-case"
import { actionClient } from "@/lib/safe-action"
import {
    userListUploadSchema,
    userListUploadSchemaType,
} from "@/zod-schemas/user-list"
import { flattenValidationErrors } from "next-safe-action"
// import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export const uploadUserListAction = actionClient
    .metadata({ actionName: "uploadUserListAction" })
    .schema(userListUploadSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: userListUploadSchemaType
        }) => {
            const uc = new SaveUserListUseCase()

            const result = await uc.execute(params)

            // revalidatePath(`/services/${params.serviceId}`)
            const c = await cookies()
            c.set("force-refresh", JSON.stringify(Math.random()))

            return {
                message: `User List ID #${result.userListId} uploaded successfully.`,
                userListId: result.userListId,
            }
        },
    )
