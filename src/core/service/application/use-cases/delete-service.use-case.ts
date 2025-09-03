import { ServiceRepository } from "@/core/service/domain/service.repository"
import { UnitOfWork } from "@/core/shared/domain/repositories/unit-of-work"
import { UserListRepository } from "@/core/users-list/domain/user-list.respository"

export class DeleteServiceUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(input: DeleteServiceInput): Promise<DeleteServiceOutput> {
        await this.uow.execute(async (uow) => {
            const serviceRepo =
                uow.getRepository<ServiceRepository>("ServiceRepository")
            const userListRepo =
                this.uow.getRepository<UserListRepository>("UserListRepository")

            const foundUserList = await userListRepo.findById(input.serviceId)

            if (foundUserList) {
                await userListRepo.delete(input.serviceId)
            }

            await serviceRepo.delete(input.serviceId)
        })

        return {
            serviceId: input.serviceId,
        }
    }
}

export type DeleteServiceInput = {
    serviceId: string
}

export type DeleteServiceOutput = {
    serviceId: string
}
