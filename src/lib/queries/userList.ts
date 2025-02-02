import "server-only"

import { db } from "@/db"
import { userListItems, userLists } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getUserListItemsByServiceId(serviceId: string) {
    const result = await db
        .select({
            userListItemId: userListItems.userListItemId,
            name: userListItems.name,
            email: userListItems.email,
            corpUserId: userListItems.corpUserId,
            area: userListItems.area,
            costCenter: userListItems.costCenter,
        })
        .from(userLists)
        .innerJoin(
            userListItems,
            eq(userListItems.userListId, userLists.userListId),
        )
        .where(eq(userLists.serviceId, serviceId))
        .orderBy(userListItems.name)
    return result
}

export type getUserListItemsByServiceIdType = Awaited<
    ReturnType<typeof getUserListItemsByServiceId>
>[number]
