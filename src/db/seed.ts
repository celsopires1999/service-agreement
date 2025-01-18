import { agreementsData } from "./data/agreements"
import { currenciesData } from "./data/currencies"
import { plansData } from "./data/plans"
import { servicesData } from "./data/services"
import { serviceSystemsData } from "./data/serviceSystems"
import { systemsData } from "./data/systems"
import { db } from "./index"
import {
    agreements,
    currencies,
    plans,
    services,
    serviceSystems,
    systems,
} from "./schema"

const main = async () => {
    console.log("Seeding...")
    try {
        await db.delete(serviceSystems)
        await db.delete(services)
        await db.delete(systems)
        await db.delete(agreements)
        await db.delete(currencies)
        await db.delete(plans)

        await db.insert(plans).values(plansData)
        await db.insert(currencies).values(currenciesData)
        await db.insert(systems).values(systemsData)
        await db.insert(agreements).values(agreementsData)
        await db.insert(services).values(servicesData)
        await db.insert(serviceSystems).values(serviceSystemsData)

        console.log("Seed completed")
        process.exit(0)
    } catch (error) {
        console.error("Error during seed: ", error)
        process.exit(1)
    }
}

main()
