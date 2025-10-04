"use server"

import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { SaveUserListUseCase } from "@/core/users-list/application/use-cases/save-user-list.use-case"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import { db } from "@/db"
import { getSession } from "@/lib/auth"
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
            const session = await getSession()

            if (
                session.user.role !== "admin" &&
                session.user.role !== "validator"
            ) {
                throw new ValidationError("Unauthorized")
            }

            const repo = new UserListDrizzleRepository(db)
            const uc = new SaveUserListUseCase(repo)

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
