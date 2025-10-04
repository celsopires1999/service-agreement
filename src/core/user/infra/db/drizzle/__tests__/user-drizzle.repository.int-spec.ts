import { UserDataBuilder } from "@/core/user/domain/user-data-builder"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { UserDrizzleRepository } from "../user-drizzle.repository"

describe("UserDrizzleRepository Integration Tests", () => {
    let userRepository: UserDrizzleRepository

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        userRepository = new UserDrizzleRepository(db)
    })

    it("should insert a user", async () => {
        const aUser = UserDataBuilder.aUser().build()
        await userRepository.insert(aUser)

        const insertedUser = await userRepository.find(aUser.userId)

        expect(insertedUser).toBeDefined()
        expect(insertedUser?.userId).toBe(aUser.userId)
        expect(insertedUser?.email).toBe(aUser.email)
        expect(insertedUser?.name).toBe(aUser.name)
        expect(insertedUser?.role).toBe(aUser.role)
    })

    it("should update a user", async () => {
        const aUser = UserDataBuilder.aUser().build()
        await userRepository.insert(aUser)

        const insertedUser = await userRepository.find(aUser.userId)
        expect(insertedUser).toBeDefined()
        expect(insertedUser?.name).toBe(aUser.name)

        const updatedUser = UserDataBuilder.aUser()
            .withUserId(aUser.userId)
            .withName("UPDATENAME")
            .build()

        await userRepository.update(updatedUser)

        const fetchedUpdatedUser = await userRepository.find(aUser.userId)
        expect(fetchedUpdatedUser).toBeDefined()
        expect(fetchedUpdatedUser?.userId).toBe(aUser.userId)
        expect(fetchedUpdatedUser?.name).toBe("UPDATENAME")
        expect(fetchedUpdatedUser?.email).toBe(updatedUser.email)
        expect(fetchedUpdatedUser?.role).toBe(updatedUser.role)
    })

    it("should delete a user", async () => {
        const aUser = UserDataBuilder.aUser().build()
        await userRepository.insert(aUser)

        let foundUser = await userRepository.find(aUser.userId)
        expect(foundUser).toBeDefined()

        await userRepository.delete(aUser.userId)

        foundUser = await userRepository.find(aUser.userId)
        expect(foundUser).toBeNull()
    })

    it("should find a user by id", async () => {
        const aUser = UserDataBuilder.aUser().build()
        await userRepository.insert(aUser)

        const foundUser = await userRepository.find(aUser.userId)
        expect(foundUser).toBeDefined()
        expect(foundUser?.userId).toBe(aUser.userId)
    })

    it("should find a user by email", async () => {
        const aUser = UserDataBuilder.aUser().build()
        await userRepository.insert(aUser)

        const foundUser = await userRepository.findByEmail(aUser.email)
        expect(foundUser).toBeDefined()
        expect(foundUser?.userId).toBe(aUser.userId)
    })

    it("should return null if user not found", async () => {
        const aUser = UserDataBuilder.aUser().build()
        const foundUser = await userRepository.find(aUser.userId)
        expect(foundUser).toBeNull()
    })

    it("should insert multiple users and find them all", async () => {
        const usersToInsert = UserDataBuilder.theUsers(3).build()
        for (const user of usersToInsert) {
            await userRepository.insert(user)
        }

        const allUsers = await userRepository.findAll()
        expect(allUsers).toHaveLength(usersToInsert.length)

        for (const user of usersToInsert) {
            const insertedUser = allUsers.find((u) => u.userId === user.userId)
            expect(insertedUser).toBeDefined()
            expect(insertedUser?.userId).toBe(user.userId)
            expect(insertedUser?.email).toBe(user.email)
            expect(insertedUser?.name).toBe(user.name)
            expect(insertedUser?.role).toBe(user.role)
        }
    })
})
