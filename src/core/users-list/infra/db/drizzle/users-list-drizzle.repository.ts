import { UsersList } from "@/core/users-list/domain/users-list"
import { db } from "@/db"
import { usersListItems, usersLists } from "@/db/schema"
import { eq } from "drizzle-orm"

export class UsersListDrizzleRepository {
    async insert(userslist: UsersList) {
        return await db.transaction(async (tx) => {
            const result = await tx
                .insert(usersLists)
                .values({
                    usersListId: userslist.usersListId,
                    systemId: userslist.systemId,
                    year: userslist.year,
                    revision: userslist.revision,
                    revisionDate: userslist.revisionDate,
                    isRevised: userslist.isRevised,
                    localPlanId: userslist.localPlanId,
                    usersNumber: userslist.usersNumber,
                })
                .returning({ insertedId: usersLists.usersListId })

            const usersListId = result[0].insertedId

            for (const item of userslist.items) {
                await tx.insert(usersListItems).values({
                    usersListItemId: item.usersListItemId,
                    usersListId,
                    name: item.name,
                    email: item.email,
                    corpUserId: item.corpUserId,
                    area: item.area,
                    costCenter: item.costCenter,
                })
            }

            return usersListId
        })
    }

    async findById(usersListId: string): Promise<UsersList | null> {
        const usersListModel = await db
            .select({
                usersListId: usersLists.usersListId,
                systemId: usersLists.systemId,
                year: usersLists.year,
                revision: usersLists.revision,
                revisionDate: usersLists.revisionDate,
                isRevised: usersLists.isRevised,
                localPlanId: usersLists.localPlanId,
                usersNumber: usersLists.usersNumber,
            })
            .from(usersLists)
            .where(eq(usersLists.usersListId, usersListId))
            .limit(1)

        if (!usersListModel.length) {
            return null
        }

        const usersListItemsModel = await db
            .select({
                usersListItemId: usersListItems.usersListItemId,
                name: usersListItems.name,
                email: usersListItems.email,
                corpUserId: usersListItems.corpUserId,
                area: usersListItems.area,
                costCenter: usersListItems.costCenter,
            })
            .from(usersListItems)
            .where(eq(usersListItems.usersListId, usersListId))

        const userList = new UsersList({
            ...usersListModel[0],
            items: [],
        })

        for (const item of usersListItemsModel) {
            userList.addItem(item)
        }
        return userList
    }
}
