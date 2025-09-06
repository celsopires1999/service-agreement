import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { UnitOfWork } from "@/core/shared/domain/repositories/unit-of-work"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"

export class DeleteAgreementUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(input: DeleteAgreementInput): Promise<DeleteAgreementOutput> {
        return await this.uow.execute(async (uow) => {
            const agreementRepo =
                uow.getRepository<AgreementDrizzleRepository>("agreement")
            const serviceRepo =
                uow.getRepository<ServiceDrizzleRepository>("service")
            const userListRepo =
                uow.getRepository<UserListDrizzleRepository>("userList")

            const foundAgreement = await agreementRepo.find(input.agreementId)

            if (!foundAgreement) {
                throw new ValidationError(
                    `Agreement ID #${input.agreementId} not found`,
                )
            }

            const foundServices = await serviceRepo.findManyByAgreementId(
                input.agreementId,
            )

            if (foundServices) {
                for (const service of foundServices) {
                    const foundUserList = await userListRepo.findById(
                        service.serviceId,
                    )

                    if (foundUserList) {
                        await userListRepo.delete(service.serviceId)
                    }

                    await serviceRepo.delete(service.serviceId)
                }
            }
            await agreementRepo.delete(input.agreementId)

            return {
                agreementId: input.agreementId,
            }
        })
    }
}

export type DeleteAgreementInput = {
    agreementId: string
}

export type DeleteAgreementOutput = {
    agreementId: string
}
