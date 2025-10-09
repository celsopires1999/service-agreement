import { SystemDataBuilder } from "@/core/system/domain/system-data-builder"
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { UpdateSystemUseCase } from "../update-system.use-case"

describe("UpdateSystemUseCase Integration Tests", () => {
    let systemRepository: SystemDrizzleRepository
    let useCase: UpdateSystemUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        systemRepository = new SystemDrizzleRepository(db)
        useCase = new UpdateSystemUseCase(systemRepository)
    })

    it("should update a system", async () => {
        const builder = SystemDataBuilder.aSystem()
        const aSystem = builder.build()
        await systemRepository.insert(aSystem)

        aSystem.changeName(builder.name)
        aSystem.changeDescription(builder.description)
        aSystem.changeApplicationId(builder.applicationId)

        await useCase.execute(aSystem)
        const updatedSystem = await systemRepository.find(aSystem.systemId)
        expect(updatedSystem?.toJSON()).toEqual(aSystem.toJSON())
    })
})
