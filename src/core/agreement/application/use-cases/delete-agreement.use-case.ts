import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import { db } from "@/db"
import {
    agreements,
    services,
    serviceSystems,
    userListItems,
    userLists,
} from "@/db/schema"
import { eq } from "drizzle-orm"

export class DeleteAgreementUseCase {
    async execute(input: DeleteAgreementInput): Promise<DeleteAgreementOutput> {
        const agreementRepo = new AgreementDrizzleRepository()
        const serviceRepo = new ServiceDrizzleRepository()
        const userListRepo = new UserListDrizzleRepository()

        const foundAgreement = await agreementRepo.findById(input.agreementId)

        if (!foundAgreement) {
            throw new ValidationError(
                `Agreement ID #${input.agreementId} not found`,
            )
        }

        const foundServices = await serviceRepo.findManyByAgreementId(
            input.agreementId,
        )

        await db.transaction(async (tx) => {
            if (foundServices) {
                for (const service of foundServices) {
                    const foundUserList = await userListRepo.findById(
                        service.serviceId,
                    )

                    if (foundUserList) {
                        await tx
                            .delete(userListItems)
                            .where(
                                eq(
                                    userListItems.userListId,
                                    foundUserList.userListId,
                                ),
                            )
                        await tx
                            .delete(userLists)
                            .where(
                                eq(
                                    userLists.userListId,
                                    foundUserList.userListId,
                                ),
                            )
                    }

                    await tx
                        .delete(serviceSystems)
                        .where(eq(serviceSystems.serviceId, service.serviceId))
                }

                await tx
                    .delete(services)
                    .where(eq(services.agreementId, input.agreementId))
            }

            await tx
                .delete(agreements)
                .where(eq(agreements.agreementId, input.agreementId))
        })

        return {
            agreementId: input.agreementId,
        }
    }
}

export type DeleteAgreementInput = {
    agreementId: string
}

export type DeleteAgreementOutput = {
    agreementId: string
}
