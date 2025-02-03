import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import { db } from "@/db"
import { services, serviceSystems, userListItems, userLists } from "@/db/schema"
import { eq } from "drizzle-orm"

export class DeleteServiceUseCase {
    async execute(input: DeleteServiceInput): Promise<DeleteServiceOutput> {
        const serviceRepo = new ServiceDrizzleRepository()
        const userListRepo = new UserListDrizzleRepository()

        const foundService = await serviceRepo.findById(input.serviceId)

        if (!foundService) {
            throw new Error(`Service ID #${input.serviceId} not found`)
        }

        const foundUserList = await userListRepo.findById(input.serviceId)

        await db.transaction(async (tx) => {
            if (foundUserList) {
                await tx
                    .delete(userListItems)
                    .where(
                        eq(userListItems.userListId, foundUserList.userListId),
                    )
                await tx
                    .delete(userLists)
                    .where(eq(userLists.userListId, foundUserList.userListId))
            }

            await tx
                .delete(serviceSystems)
                .where(eq(serviceSystems.serviceId, foundService.serviceId))

            await tx
                .delete(services)
                .where(eq(services.serviceId, input.serviceId))
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
