import { SystemDataBuilder } from "@/core/system/domain/system-data-builder"
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { CreateSystemUseCase } from "../create-system.use-case"

describe("CreateSystemUseCase Integration Tests", () => {
    let systemRepository: SystemDrizzleRepository
    let useCase: CreateSystemUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        systemRepository = new SystemDrizzleRepository(db)
        useCase = new CreateSystemUseCase(systemRepository)
    })

    it("should create a system", async () => {
        const aSystem = SystemDataBuilder.aSystem().build()
        const result = await useCase.execute(aSystem)
        const createdSystem = await systemRepository.find(result.systemId)
        expect(createdSystem).toBeDefined()
        expect(createdSystem?.systemId).toBe(result.systemId)
        expect(createdSystem?.name).toBe(aSystem.name)
        expect(createdSystem?.description).toBe(aSystem.description)
        expect(createdSystem?.applicationId).toBe(aSystem.applicationId)
    })
})
