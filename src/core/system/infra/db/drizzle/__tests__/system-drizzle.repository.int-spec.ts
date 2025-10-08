import { SystemDataBuilder } from "@/core/system/domain/system-data-builder"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { SystemDrizzleRepository } from "../system-drizzle.repository"

describe("SystemDrizzleRepository Integration Tests", () => {
    let systemRepository: SystemDrizzleRepository

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        systemRepository = new SystemDrizzleRepository(db)
    })

    it("should insert a system", async () => {
        const aSystem = SystemDataBuilder.aSystem().build()
        await systemRepository.insert(aSystem)

        const insertedSystem = await systemRepository.find(aSystem.systemId)

        expect(insertedSystem).toBeDefined()
        expect(insertedSystem?.systemId).toBe(aSystem.systemId)
        expect(insertedSystem?.name).toBe(aSystem.name)
        expect(insertedSystem?.description).toBe(aSystem.description)
        expect(insertedSystem?.applicationId).toBe(aSystem.applicationId)
    })

    it("should update a system", async () => {
        const aSystem = SystemDataBuilder.aSystem().build()
        await systemRepository.insert(aSystem)

        const insertedSystem = await systemRepository.find(aSystem.systemId)
        expect(insertedSystem).toBeDefined()
        expect(insertedSystem?.name).toBe(aSystem.name)

        const updatedSystem = SystemDataBuilder.aSystem()
            .withSystemId(aSystem.systemId)
            .withName("UPDATENAME")
            .build()

        await systemRepository.update(updatedSystem)

        const fetchedUpdatedSystem = await systemRepository.find(
            aSystem.systemId,
        )
        expect(fetchedUpdatedSystem).toBeDefined()
        expect(fetchedUpdatedSystem?.systemId).toBe(aSystem.systemId)
        expect(fetchedUpdatedSystem?.name).toBe("UPDATENAME")
        expect(fetchedUpdatedSystem?.description).toBe(
            updatedSystem.description,
        )
        expect(fetchedUpdatedSystem?.applicationId).toBe(
            updatedSystem.applicationId,
        )
    })

    it("should delete a system", async () => {
        const aSystem = SystemDataBuilder.aSystem().build()
        await systemRepository.insert(aSystem)

        let foundSystem = await systemRepository.find(aSystem.systemId)
        expect(foundSystem).toBeDefined()

        await systemRepository.delete(aSystem.systemId)

        foundSystem = await systemRepository.find(aSystem.systemId)
        expect(foundSystem).toBeNull()
    })

    it("should find a system by id", async () => {
        const aSystem = SystemDataBuilder.aSystem().build()
        await systemRepository.insert(aSystem)

        const foundSystem = await systemRepository.find(aSystem.systemId)
        expect(foundSystem).toBeDefined()
        expect(foundSystem?.systemId).toBe(aSystem.systemId)
    })

    it("should return null if system not found", async () => {
        const aSystem = SystemDataBuilder.aSystem().build()
        const foundSystem = await systemRepository.find(aSystem.systemId)
        expect(foundSystem).toBeNull()
    })

    it("should insert multiple systems and find them", async () => {
        const systemsToInsert = SystemDataBuilder.theSystems(3).build()
        for (const system of systemsToInsert) {
            await systemRepository.insert(system)
        }

        for (const system of systemsToInsert) {
            const insertedSystem = await systemRepository.find(system.systemId)
            expect(insertedSystem).toBeDefined()
            expect(insertedSystem?.systemId).toBe(system.systemId)
            expect(insertedSystem?.name).toBe(system.name)
            expect(insertedSystem?.description).toBe(system.description)
            expect(insertedSystem?.applicationId).toBe(system.applicationId)
        }
    })
})
