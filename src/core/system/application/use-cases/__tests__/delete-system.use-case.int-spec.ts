import { SystemDataBuilder } from "@/core/system/domain/system-data-builder"
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { DeleteSystemUseCase } from "../delete-system.use-case"

describe("DeleteSystemUseCase Integration Tests", () => {
    let systemRepository: SystemDrizzleRepository
    let useCase: DeleteSystemUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        systemRepository = new SystemDrizzleRepository(db)
        useCase = new DeleteSystemUseCase(systemRepository)
    })

    it("should delete a system", async () => {
        const aSystem = SystemDataBuilder.aSystem().build()
        await systemRepository.insert(aSystem)

        await useCase.execute({ systemId: aSystem.systemId })
        const deletedSystem = await systemRepository.find(aSystem.systemId)
        expect(deletedSystem).toBeNull()
    })

    it("should throw a validation error when trying to delete a non-existent system", async () => {
        const nonExistentSystemId = SystemDataBuilder.aSystem().build().systemId
        await expect(
            useCase.execute({ systemId: nonExistentSystemId }),
        ).rejects.toThrow(
            new ValidationError(`System ID #${nonExistentSystemId} not found`),
        )
    })
})
