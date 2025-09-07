"use server"

import { flattenValidationErrors } from "next-safe-action"

import { CreateAgreementUseCase } from "@/core/agreement/application/use-cases/create-agreement.use-case"
import { UpdateAgreementUseCase } from "@/core/agreement/application/use-cases/update-agreement.use-case"
import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { db } from "@/db"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import {
    insertAgreementSchema,
    type insertAgreementSchemaType,
} from "@/zod-schemas/agreement"
import { revalidatePath } from "next/cache"

export const saveAgreementAction = actionClient
    .metadata({ actionName: "saveAgreementAction" })
    .schema(insertAgreementSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: agreement,
        }: {
            parsedInput: insertAgreementSchemaType
        }) => {
            const session = await getSession()

            if (session.user.role !== "admin") {
                throw new ValidationError("Unauthorized")
            }

            const uow = new UnitOfWorkDrizzle(db, {
                agreement: (db) => new AgreementDrizzleRepository(db),
                service: (db) => new ServiceDrizzleRepository(db),
            })

            // New Agreement
            if (
                agreement.agreementId === "" ||
                agreement.agreementId === "(New)"
            ) {
                const insertAgreement = new CreateAgreementUseCase(uow)

                const result = await insertAgreement.execute({
                    agreement: agreement,
                })

                revalidatePath("/agreements")

                return {
                    message: `Agreement ID #${result.agreementId} created successfully`,
                    agreementId: result.agreementId,
                }
            }

            // Change Agreement
            const updateAgreement = new UpdateAgreementUseCase(uow)
            const result = await updateAgreement.execute({
                agreement: agreement,
            })
            revalidatePath("/agreements")

            return {
                message: `Agreement ID #${result.agreementId} updated successfully`,
                agreementId: result.agreementId,
            }
        },
    )
