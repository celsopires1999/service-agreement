import { UserDataBuilder } from "@/core/user/domain/user-data-builder"
import { UserDrizzleRepository } from "@/core/user/infra/db/drizzle/user-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { UpdateUserUseCase } from "../update-user.use-case"

describe("UpdateUserUseCase Integration Tests", () => {
    let userRepository: UserDrizzleRepository
    let useCase: UpdateUserUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        userRepository = new UserDrizzleRepository(db)
        useCase = new UpdateUserUseCase(userRepository)
    })

    it("should update a user", async () => {
        const builder = UserDataBuilder.aUser()
        const aUser = builder.build()
        await userRepository.insert(aUser)

        aUser.changeName(builder.name)
        aUser.changeEmail(builder.email)
        aUser.changeRole(builder.role)

        await useCase.execute(aUser)
        const updatedUser = await userRepository.find(aUser.userId)
        expect(updatedUser?.toJSON()).toEqual(aUser.toJSON())
    })
})
