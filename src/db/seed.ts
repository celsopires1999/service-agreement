import { db } from "./index"
import { agreements, systems, services, serviceSystems } from "./schema"
import { systemsData } from "./data/systems"
import { agreementsData } from "./data/agreements"
import { servicesData } from "./data/services"
import { serviceSystemsData } from "./data/serviceSystems"

const main = async () => {
    console.log("Seeding...")

    try {
        await db.delete(serviceSystems)
        await db.delete(services)
        await db.delete(systems)
        await db.delete(agreements)

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
