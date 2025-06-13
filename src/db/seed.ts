import { agreementsData } from "./data/agreements"
import { plansData } from "./data/plans"
import { servicesData } from "./data/services"
import { serviceSystemsData } from "./data/serviceSystems"
import { systemsData } from "./data/systems"
import { userListItemsData, userListsData } from "./data/userLists"
import { usersData } from "./data/users"
import { db } from "./index"
import {
    agreements,
    plans,
    services,
    serviceSystems,
    systems,
    userListItems,
    userLists,
    users,
} from "./schema"

const main = async () => {
    console.log("Seeding...")
    try {
        await db.delete(userListItems)
        await db.delete(userLists)
        await db.delete(serviceSystems)
        await db.delete(services)
        await db.delete(systems)
        await db.delete(agreements)
        await db.delete(plans)
        await db.delete(users)

        await db.insert(plans).values(plansData)
        await db.insert(systems).values(systemsData)
        await db.insert(agreements).values(agreementsData)
        await db.insert(services).values(servicesData)
        await db.insert(serviceSystems).values(serviceSystemsData)
        await db.insert(userLists).values(userListsData)
        await db.insert(userListItems).values(userListItemsData)
        await db.insert(users).values(usersData)

        console.log("Seed completed")
        process.exit(0)
    } catch (error) {
        console.error("Error during seed: ", error)
        process.exit(1)
    }
}

main()
