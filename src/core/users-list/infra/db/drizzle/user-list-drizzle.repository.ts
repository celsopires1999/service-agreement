import { UserList } from "@/core/users-list/domain/user-list"
import { db } from "@/db"
import { userListItems, userLists } from "@/db/schema"
import { eq } from "drizzle-orm"

export class UserListDrizzleRepository {
    async save(userlist: UserList) {
        return await db.transaction(async (tx) => {
            const existingUserList = await tx
                .select()
                .from(userLists)
                .where(eq(userLists.serviceId, userlist.serviceId))
                .limit(1)

            if (existingUserList.length) {
                const userListId = existingUserList[0].userListId
                await tx
                    .delete(userListItems)
                    .where(eq(userListItems.userListId, userListId))
                await tx
                    .delete(userLists)
                    .where(eq(userLists.userListId, userListId))
            }

            const result = await tx
                .insert(userLists)
                .values({
                    userListId: userlist.userListId,
                    serviceId: userlist.serviceId,
                    usersNumber: userlist.usersNumber,
                })
                .returning({ insertedId: userLists.userListId })

            const userListId = result[0].insertedId

            for (const item of userlist.items) {
                await tx.insert(userListItems).values({
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
        })
    }

    async findById(userListId: string): Promise<UserList | null> {
        const userListModel = await db
            .select({
                userListId: userLists.userListId,
                serviceId: userLists.serviceId,
                usersNumber: userLists.usersNumber,
            })
            .from(userLists)
            .where(eq(userLists.userListId, userListId))
            .limit(1)

        if (!userListModel.length) {
            return null
        }

        const userListItemsModel = await db
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
        const existingUserList = await db
            .select()
            .from(userLists)
            .where(eq(userLists.serviceId, serviceId))
            .limit(1)

        if (!existingUserList.length) {
            throw new Error(`User List for service ID #${serviceId} not found`)
        }

        return await db.transaction(async (tx) => {
            const userListId = existingUserList[0].userListId
            await tx
                .delete(userListItems)
                .where(eq(userListItems.userListId, userListId))
            await tx
                .delete(userLists)
                .where(eq(userLists.userListId, userListId))
            return userListId
        })
    }
}
