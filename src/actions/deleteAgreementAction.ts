"use server"

import { DeleteAgreementUseCase } from "@/core/agreement/application/use-cases/delete-agreement.use-case"
import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import { db } from "@/db"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const deleteAgreementSchema = z.object({
    agreementId: z.string().uuid("invalid UUID"),
})

export type deleteAgreementSchemaType = typeof deleteAgreementSchema._type

export const deleteAgreementAction = actionClient
    .metadata({ actionName: "deleteAgreementAction" })
    .schema(deleteAgreementSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: deleteAgreementSchemaType
        }) => {
            const session = await getSession()

            if (session.user.role !== "admin") {
                throw new ValidationError("Unauthorized")
            }

            const uow = new UnitOfWorkDrizzle(db, {
                agreement: (db) => new AgreementDrizzleRepository(db),
                service: (db) => new ServiceDrizzleRepository(db),
                userList: (db) => new UserListDrizzleRepository(db),
            })

            const uc = new DeleteAgreementUseCase(uow)
            const result = await uc.execute({
                agreementId: params.agreementId,
            })

            revalidatePath(`/agreements/`)

            return {
                message: `Agreement ID #${result.agreementId} deleted successfully.`,
            }
        },
    )
