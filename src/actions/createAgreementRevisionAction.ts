"use server"

import { CreateAgreementRevisionUseCase } from "@/core/agreement/application/use-cases/create-agreement-revision.use-case"
import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import { db } from "@/db"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import {
    createAgreementRevisionSchema,
    createAgreementRevisionSchemaType,
} from "@/zod-schemas/agreement"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"

export const createAgreementRevisionAction = actionClient
    .metadata({ actionName: "createAgreementRevisionAction" })
    .schema(createAgreementRevisionSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: createAgreementRevisionSchemaType
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

            const uc = new CreateAgreementRevisionUseCase(uow)

            const result = await uc.execute({
                agreementId: params.agreementId,
                revisionDate: params.revisionDate,
                providerPlanId: params.providerPlanId,
                localPlanId: params.localPlanId,
            })

            revalidatePath(`/agreements/${params.agreementId}`)

            return {
                message: `Agreement ID #${result.agreementId} created successfully.`,
                agreementId: result.agreementId,
            }
        },
    )
