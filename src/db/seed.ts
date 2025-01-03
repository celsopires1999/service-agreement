import { db } from "./index"
import {
    agreements,
    systems,
    services,
    serviceSystems,
    currencies,
} from "./schema"
import { systemsData } from "./data/systems"
import { agreementsData } from "./data/agreements"
import { servicesData } from "./data/services"
import { serviceSystemsData } from "./data/serviceSystems"
import { currenciesData } from "./data/currencies"

const main = async () => {
    console.log("Seeding...")

    try {
        await db.delete(serviceSystems)
        await db.delete(services)
        await db.delete(systems)
        await db.delete(agreements)
        await db.delete(currencies)

        await db.insert(systems).values(systemsData)
        await db.insert(agreements).values(agreementsData)
        await db.insert(services).values(servicesData)
        await db.insert(serviceSystems).values(serviceSystemsData)
        await db.insert(currencies).values(currenciesData)

        console.log("Seed completed")
        process.exit(0)
    } catch (error) {
        console.error("Error during seed: ", error)
        process.exit(1)
    }
}

main()
