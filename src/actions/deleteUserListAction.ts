"use server"

import { DeleteUserListUseCase } from "@/core/users-list/application/use-cases/delete-user-list.use-case"
import { actionClient } from "@/lib/safe-action"
import { flattenValidationErrors } from "next-safe-action"
// import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { z } from "zod"

const deleteUserListSchema = z.object({
    serviceId: z.string().uuid("invalid Service ID"),
})

type deleteSystemSchemaType = typeof deleteUserListSchema._type

export const deleteUserListAction = actionClient
    .metadata({ actionName: "deleteUserListAction" })
    .schema(deleteUserListSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: deleteSystemSchemaType
        }) => {
            const uc = new DeleteUserListUseCase()

            const result = await uc.execute(params)

            // revalidatePath(`/services/${params.serviceId}`)
            const c = await cookies()
            c.set("force-refresh", JSON.stringify(Math.random()))

            return {
                message: `User List ID #${result.userListId} deleted successfully.`,
                userListId: result.userListId,
            }
        },
    )
