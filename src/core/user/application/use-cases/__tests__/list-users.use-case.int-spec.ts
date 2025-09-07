import { UserDataBuilder } from "@/core/user/domain/user-data-builder"
import { UserDrizzleRepository } from "@/core/user/infra/db/drizzle/user-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { ListUsersUseCase } from "../list-users.use-case"

describe("ListUsersUseCase Integration Tests", () => {
    let userRepository: UserDrizzleRepository
    let useCase: ListUsersUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        userRepository = new UserDrizzleRepository(db)
        useCase = new ListUsersUseCase(userRepository)
    })

    it("should list all users", async () => {
        const usersToInsert = UserDataBuilder.theUsers(3).build()
        for (const user of usersToInsert) {
            await userRepository.insert(user)
        }

        const output = await useCase.execute()
        expect(output).toHaveLength(usersToInsert.length)
        expect(output.map((o) => o.userId).sort()).toEqual(
            usersToInsert.map((u) => u.userId).sort(),
        )
    })

    it("should return an empty array when no users exist", async () => {
        const output = await useCase.execute()
        expect(output).toHaveLength(0)
    })
})
