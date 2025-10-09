import { Service } from "@/core/service/domain/service"
import { ServiceRepository } from "@/core/service/domain/service.repository"
import { UnitOfWork } from "@/core/shared/domain/repositories/unit-of-work"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UserList } from "@/core/users-list/domain/user-list"
import { UserListRepository } from "@/core/users-list/domain/user-list.respository"
import { AgreementRepository } from "../../domain/agreement.repository"

export class CreateAgreementRevisionUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(
        input: CreateAgreementRevisionInput,
    ): Promise<CreateAgreementRevisionOutput> {
        return await this.uow.execute(async (uow) => {
            const agreementRepo =
                uow.getRepository<AgreementRepository>("agreement")
            const serviceRepo = uow.getRepository<ServiceRepository>("service")
            const userListRepo =
                uow.getRepository<UserListRepository>("userList")

            const sourceAgreement = await agreementRepo.find(input.agreementId)

            if (!sourceAgreement) {
                throw new ValidationError(
                    `Agreement ID #${input.agreementId} not found`,
                )
            }

            const sourceServices = await serviceRepo.findManyByAgreementId(
                input.agreementId,
            )
            const newAgreement = sourceAgreement.newRevision(
                input.revisionDate,
                input.providerPlanId,
                input.localPlanId,
            )

            await agreementRepo.insert(newAgreement)

            if (!sourceServices) {
                return {
                    agreementId: newAgreement.agreementId,
                }
            }

            for (const service of sourceServices) {
                const newService = Service.create({
                    agreementId: newAgreement.agreementId,
                    name: service.name,
                    description: service.description,
                    runAmount: service.runAmount,
                    chgAmount: service.chgAmount,
                    currency: service.currency,
                    responsibleEmail: service.responsibleEmail,
                    providerAllocation: service.providerAllocation,
                    localAllocation: service.localAllocation,
                    validatorEmail: service.validatorEmail,
                    documentUrl: service.documentUrl,
                })

                newService.validate()

                for (const serviceSystem of service.serviceSystems) {
                    newService.addServiceSystem(
                        serviceSystem.systemId,
                        serviceSystem.allocation,
                    )
                }

                newService.changeActivationStatusBasedOnAllocation()

                const sourceUserList = await userListRepo.findById(
                    service.serviceId,
                )

                const newUserList = UserList.create({
                    serviceId: newService.serviceId,
                    items: [],
                })

                if (sourceUserList?.items) {
                    for (const item of sourceUserList.items) {
                        newUserList.addItem({
                            name: item.name,
                            email: item.email,
                            corpUserId: item.corpUserId,
                            area: item.area,
                            costCenter: item.costCenter,
                        })
                    }
                }

                await serviceRepo.insert(newService)

                if (newUserList.items.length > 0) {
                    await userListRepo.save(newUserList)
                }
            }

            return {
                agreementId: newAgreement.agreementId,
            }
        })
    }
}

export type CreateAgreementRevisionInput = {
    agreementId: string
    revisionDate: string
    providerPlanId: string
    localPlanId: string
}

export type CreateAgreementRevisionOutput = {
    agreementId: string
}
