import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { Service } from "@/core/service/domain/service"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { UserList } from "@/core/users-list/domain/user-list"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import { db } from "@/db"
import {
    agreements,
    services,
    serviceSystems,
    userLists,
    userListItems,
} from "@/db/schema"

export class CreateAgreementRevisionUseCase {
    async execute(
        input: CreateAgreementRevisionInput,
    ): Promise<CreateAgreementRevisionOutput> {
        const agreementRepo = new AgreementDrizzleRepository()
        const serviceRepo = new ServiceDrizzleRepository()
        const userListRepo = new UserListDrizzleRepository()

        const sourceAgreement = await agreementRepo.findById(input.agreementId)

        if (!sourceAgreement) {
            throw new Error(`Agreement ID #${input.agreementId} not found`)
        }

        const sourceServices = await serviceRepo.findManyByAgreementId(
            input.agreementId,
        )
        const newAgreement = sourceAgreement.newRevision(
            input.revisionDate,
            input.providerPlanId,
            input.localPlanId,
        )

        await db.transaction(async (tx) => {
            const result = await tx
                .insert(agreements)
                .values({
                    agreementId: newAgreement.agreementId,
                    year: newAgreement.year,
                    code: newAgreement.code,
                    revision: newAgreement.revision,
                    isRevised: newAgreement.isRevised,
                    revisionDate: newAgreement.revisionDate,
                    providerPlanId: newAgreement.providerPlanId,
                    localPlanId: newAgreement.localPlanId,
                    name: newAgreement.name,
                    description: newAgreement.description,
                    contactEmail: newAgreement.contactEmail,
                    comment: newAgreement.comment,
                })
                .returning({ insertedId: agreements.agreementId })

            if (result[0].insertedId !== newAgreement.agreementId) {
                throw new Error(
                    `Agreement ID #${newAgreement.agreementId} not created`,
                )
            }

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
                })

                service.serviceSystems.forEach((serviceSystem) => {
                    newService.addServiceSystem(
                        serviceSystem.systemId,
                        serviceSystem.allocation,
                    )
                })

                const sourceUserList = await userListRepo.findById(
                    service.serviceId,
                )

                const newUserList = UserList.create({
                    serviceId: newService.serviceId,
                    items: [],
                })

                if (sourceUserList) {
                    sourceUserList.items.forEach((item) => {
                        newUserList.addItem({
                            name: item.name,
                            email: item.email,
                            corpUserId: item.corpUserId,
                            area: item.area,
                            costCenter: item.costCenter,
                        })
                    })
                }

                const serviceResult = await tx
                    .insert(services)
                    .values({
                        serviceId: newService.serviceId,
                        agreementId: newService.agreementId,
                        name: newService.name,
                        description: newService.description,
                        runAmount: newService.runAmount,
                        chgAmount: newService.chgAmount,
                        amount: newService.amount,
                        currency: newService.currency,
                        responsibleEmail: newService.responsibleEmail,
                        isActive: newService.isActive,
                        providerAllocation: newService.providerAllocation,
                        localAllocation: newService.localAllocation,
                    })
                    .returning()

                if (serviceResult.length !== 1) {
                    throw new Error(
                        `Error creating service for agreement ID #${newAgreement.agreementId} and service ID #${newService.serviceId}`,
                    )
                }

                for (const serviceSystem of newService.serviceSystems) {
                    const resultServiceSystem = await tx
                        .insert(serviceSystems)
                        .values({
                            serviceId: serviceSystem.serviceId,
                            systemId: serviceSystem.systemId,
                            allocation: serviceSystem.allocation,
                            runAmount: serviceSystem.runAmount,
                            chgAmount: serviceSystem.chgAmount,
                            amount: serviceSystem.amount,
                            currency: serviceSystem.currency,
                        })
                        .returning()

                    if (resultServiceSystem.length !== 1) {
                        throw new Error(
                            `Error creating service system for agreement ID #${newAgreement.agreementId} and service ID #${newService.serviceId}`,
                        )
                    }
                }

                if (newUserList.items.length > 0) {
                    const resultUserList = await tx
                        .insert(userLists)
                        .values({
                            userListId: newUserList.userListId,
                            serviceId: newUserList.serviceId,
                            usersNumber: newUserList.usersNumber,
                        })
                        .returning()

                    if (resultUserList.length !== 1) {
                        throw new Error(
                            `Error creating user list for agreement ID #${newAgreement.agreementId} and service ID #${newService.serviceId}`,
                        )
                    }

                    for (const item of newUserList.items) {
                        const resultUserListItem = await tx
                            .insert(userListItems)
                            .values({
                                userListItemId: item.userListItemId,
                                userListId: newUserList.userListId,
                                name: item.name,
                                email: item.email,
                                corpUserId: item.corpUserId,
                                area: item.area,
                                costCenter: item.costCenter,
                            })
                            .returning()

                        if (resultUserListItem.length !== 1) {
                            throw new Error(
                                `Error creating user list item for agreement ID #${newAgreement.agreementId} and service ID #${newService.serviceId}`,
                            )
                        }
                    }
                }
            }
        })

        return {
            agreementId: newAgreement.agreementId,
        }
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
