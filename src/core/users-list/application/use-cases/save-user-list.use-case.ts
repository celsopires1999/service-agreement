import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UserList } from "@/core/users-list/domain/user-list"
import { userListUploadSchemaType } from "@/zod-schemas/user-list"
import { UserListRepository } from "../../domain/user-list.respository"

export class SaveUserListUseCase {
    constructor(private readonly userListRepo: UserListRepository) {}

    async execute(input: SaveUserListInput): Promise<SaveUserListOutput> {
        if (!input.items.length) {
            throw new ValidationError(`User list must have at least one item`)
        }

        const userList = UserList.create({
            serviceId: input.serviceId,
            items: [],
        })

        for (const item of input.items) {
            userList.addItem(item)
        }

        const userListId = await this.userListRepo.save(userList)

        return {
            userListId,
        }
    }
}

export type SaveUserListInput = userListUploadSchemaType

export type SaveUserListOutput = {
    userListId: string
}
