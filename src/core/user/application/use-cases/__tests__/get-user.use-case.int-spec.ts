import { UserDataBuilder } from "@/core/user/domain/user-data-builder"
import { UserDrizzleRepository } from "@/core/user/infra/db/drizzle/user-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { GetUserUseCase } from "../get-user.use-case"

describe("GetUserUseCase Integration Tests", () => {
    let userRepository: UserDrizzleRepository
    let useCase: GetUserUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        userRepository = new UserDrizzleRepository(db)
        useCase = new GetUserUseCase(userRepository)
    })

    it("should get a user", async () => {
        const aUser = UserDataBuilder.aUser().build()
        await userRepository.insert(aUser)
        const output = await useCase.execute({ userId: aUser.userId })
        expect(output).toEqual(aUser.toJSON())
    })

    it("should throw an error when user not found", async () => {
        const nonExistentUserId = UserDataBuilder.aUser().build().userId
        await expect(
            useCase.execute({ userId: nonExistentUserId }),
        ).rejects.toThrow(
            new ValidationError(`User ID #${nonExistentUserId} not found`),
        )
    })
})
