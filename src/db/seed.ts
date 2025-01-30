import { agreementsData } from "./data/agreements"
import { plansData } from "./data/plans"
import { servicesData } from "./data/services"
import { serviceSystemsData } from "./data/serviceSystems"
import { systemsData } from "./data/systems"
import { usersListItemsData, usersListsData } from "./data/users-lists"
import { db } from "./index"
import {
    agreements,
    plans,
    services,
    serviceSystems,
    systems,
    usersListItems,
    usersLists,
} from "./schema"

const main = async () => {
    console.log("Seeding...")
    try {
        await db.delete(usersListItems)
        await db.delete(usersLists)
        await db.delete(serviceSystems)
        await db.delete(services)
        await db.delete(systems)
        await db.delete(agreements)
        await db.delete(plans)

        await db.insert(plans).values(plansData)
        await db.insert(systems).values(systemsData)
        await db.insert(agreements).values(agreementsData)
        await db.insert(services).values(servicesData)
        await db.insert(serviceSystems).values(serviceSystemsData)
        await db.insert(usersLists).values(usersListsData)
        await db.insert(usersListItems).values(usersListItemsData)

        console.log("Seed completed")
        process.exit(0)
    } catch (error) {
        console.error("Error during seed: ", error)
        process.exit(1)
    }
}

main()
