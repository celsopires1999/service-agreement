import { UserListRepository } from "../../domain/user-list.respository"

export class DeleteUserListUseCase {
    constructor(private readonly userListRepo: UserListRepository) {}

    async execute(input: DeleteUserListInput): Promise<DeleteUserListOutput> {
        const userListId = await this.userListRepo.delete(input.serviceId)

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
