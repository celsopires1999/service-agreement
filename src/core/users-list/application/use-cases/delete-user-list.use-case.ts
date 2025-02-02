import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"

export class DeleteUserListUseCase {
    async execute(input: DeleteUserListInput): Promise<DeleteUserListOutput> {
        const userListRepo = new UserListDrizzleRepository()
        const userListId = await userListRepo.delete(input.serviceId)

        return {
            userListId,
        }
    }
}

export type DeleteUserListInput = {
    serviceId: string
}

export type DeleteUserListOutput = {
    userListId: string
}
