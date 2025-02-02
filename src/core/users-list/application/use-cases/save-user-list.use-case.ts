import { UserList } from "@/core/users-list/domain/user-list"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import { userListUploadSchemaType } from "@/zod-schemas/user-list"

export class SaveUserListUseCase {
    async execute(input: SaveUserListInput): Promise<SaveUserListOutput> {
        const userList = UserList.create({
            serviceId: input.serviceId,
            items: [],
        })

        for (const item of input.items) {
            userList.addItem(item)
        }

        const userListRepo = new UserListDrizzleRepository()
        const userListId = await userListRepo.save(userList)

        return {
            userListId,
        }
    }
}

export type SaveUserListInput = userListUploadSchemaType

export type SaveUserListOutput = {
    userListId: string
}
