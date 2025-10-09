import { UserDataBuilder } from "@/core/user/domain/user-data-builder"
import { UserDrizzleRepository } from "@/core/user/infra/db/drizzle/user-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { CreateUserUseCase } from "../create-user.use-case"

describe("CreateUserUseCase Integration Tests", () => {
    let userRepository: UserDrizzleRepository
    let useCase: CreateUserUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        userRepository = new UserDrizzleRepository(db)
        useCase = new CreateUserUseCase(userRepository)
    })

    it("should create a user", async () => {
        const aUser = UserDataBuilder.aUser().build()
        const { userId } = await useCase.execute(aUser)
        const createdUser = await userRepository.find(userId)
        expect(createdUser).toBeDefined()
        expect(createdUser?.name).toBe(aUser.name)
        expect(createdUser?.email).toBe(aUser.email)
        expect(createdUser?.role).toBe(aUser.role)
    })
})
