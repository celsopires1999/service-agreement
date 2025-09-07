import { UserDataBuilder } from "@/core/user/domain/user-data-builder"
import { UserDrizzleRepository } from "@/core/user/infra/db/drizzle/user-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { DeleteUserUseCase } from "../delete-user.use-case"

describe("DeleteUserUseCase Integration Tests", () => {
    let userRepository: UserDrizzleRepository
    let useCase: DeleteUserUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        userRepository = new UserDrizzleRepository(db)
        useCase = new DeleteUserUseCase(userRepository)
    })

    it("should delete a user", async () => {
        const aUser = UserDataBuilder.aUser().build()
        await userRepository.insert(aUser)

        await useCase.execute({ userId: aUser.userId })
        const deletedUser = await userRepository.find(aUser.userId)
        expect(deletedUser).toBeNull()
    })

    it("should throw a validation error when trying to delete a non-existent user", async () => {
        const nonExistentUserId = UserDataBuilder.aUser().build().userId
        await expect(
            useCase.execute({ userId: nonExistentUserId }),
        ).rejects.toThrow(
            new ValidationError(`User ID #${nonExistentUserId} not found`),
        )
    })
})
