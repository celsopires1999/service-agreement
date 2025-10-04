import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UserList } from "@/core/users-list/domain/user-list"
import { UserListRepository } from "@/core/users-list/domain/user-list.respository"
import { DB } from "@/db"
import { userListItems, userLists } from "@/db/schema"
import { eq } from "drizzle-orm"

export class UserListDrizzleRepository implements UserListRepository {
    constructor(private readonly db: DB) {}

    async save(userlist: UserList) {
        const existingUserList = await this.db
            .select()
            .from(userLists)
            .where(eq(userLists.serviceId, userlist.serviceId))
            .limit(1)

        if (existingUserList.length) {
            const userListId = existingUserList[0].userListId
            await this.db
                .delete(userListItems)
                .where(eq(userListItems.userListId, userListId))
            await this.db
                .delete(userLists)
                .where(eq(userLists.userListId, userListId))
        }

        const result = await this.db
            .insert(userLists)
            .values({
                userListId: userlist.userListId,
                serviceId: userlist.serviceId,
                usersNumber: userlist.usersNumber,
            })
            .returning({ insertedId: userLists.userListId })

        const userListId = result[0].insertedId

        for (const item of userlist.items) {
            await this.db.insert(userListItems).values({
                userListItemId: item.userListItemId,
                userListId,
                name: item.name,
                email: item.email,
                corpUserId: item.corpUserId,
                area: item.area,
                costCenter: item.costCenter,
            })
        }

        return userListId
    }

    async findById(serviceId: string): Promise<UserList | null> {
        const userListModel = await this.db
            .select({
                userListId: userLists.userListId,
                serviceId: userLists.serviceId,
                usersNumber: userLists.usersNumber,
            })
            .from(userLists)
            .where(eq(userLists.serviceId, serviceId))
            .limit(1)

        if (!userListModel.length) {
            return null
        }

        const userListId = userListModel[0].userListId
        const userListItemsModel = await this.db
            .select({
                userListItemId: userListItems.userListItemId,
                name: userListItems.name,
                email: userListItems.email,
                corpUserId: userListItems.corpUserId,
                area: userListItems.area,
                costCenter: userListItems.costCenter,
            })
            .from(userListItems)
            .where(eq(userListItems.userListId, userListId))

        const userList = new UserList({
            ...userListModel[0],
            items: [],
        })

        for (const item of userListItemsModel) {
            userList.addItem(item)
        }
        return userList
    }

    async delete(serviceId: string): Promise<string> {
        const existingUserList = await this.db
            .select()
            .from(userLists)
            .where(eq(userLists.serviceId, serviceId))
            .limit(1)

        if (!existingUserList.length) {
            throw new ValidationError(
                `User List for service ID #${serviceId} not found`,
            )
        }

        const userListId = existingUserList[0].userListId
        await this.db
            .delete(userListItems)
            .where(eq(userListItems.userListId, userListId))
        await this.db
            .delete(userLists)
            .where(eq(userLists.userListId, userListId))
        return userListId
    }
}
