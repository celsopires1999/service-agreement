import { SystemDataBuilder } from "@/core/system/domain/system-data-builder"
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { GetSystemUseCase } from "../get-system.use-case"

describe("GetSystemUseCase Integration Tests", () => {
    let systemRepository: SystemDrizzleRepository
    let useCase: GetSystemUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        systemRepository = new SystemDrizzleRepository(db)
        useCase = new GetSystemUseCase(systemRepository)
    })

    it("should get a system", async () => {
        const aSystem = SystemDataBuilder.aSystem().build()
        await systemRepository.insert(aSystem)
        const output = await useCase.execute({ systemId: aSystem.systemId })
        expect(output).toEqual(aSystem.toJSON())
    })

    it("should throw an error when system not found", async () => {
        const nonExistentSystemId = SystemDataBuilder.aSystem().build().systemId
        await expect(
            useCase.execute({ systemId: nonExistentSystemId }),
        ).rejects.toThrow(
            new ValidationError(`System ID #${nonExistentSystemId} not found`),
        )
    })
})
