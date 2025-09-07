import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { Role } from "../role"
import { User } from "../user"
import { UserDataBuilder } from "../user-data-builder"

describe("UserDataBuilder Unit Tests", () => {
    describe("userId prop", () => {
        const builder = UserDataBuilder.aUser()
        test("should throw error when any with methods has called", () => {
            expect(() => builder.userId).toThrow(
                new Error(
                    `Property userId does not have a factory, use "with" method instead`,
                ),
            )
        })

        test("should be undefined", () => {
            expect(builder["_userId"]).toBeUndefined()
        })

        test("withUserId", () => {
            const userId = new Uuid().toString()
            const $this = builder.withUserId(userId)
            expect($this).toBeInstanceOf(UserDataBuilder)
            expect(builder["_userId"]).toBe(userId)

            builder.withUserId(() => userId)
            //@ts-expect-error _userId is a callable
            expect(builder["_userId"]()).toBe(userId)

            expect(builder.userId).toBe(userId)
        })

        test("should pass index to userId factory", () => {
            const userId = new Uuid().toString()
            const mockFactory = jest.fn(() => userId)
            builder.withUserId(mockFactory)
            builder.build()
            expect(mockFactory).toHaveBeenCalledTimes(1)

            const builderMany = UserDataBuilder.theUsers(2)
            builderMany.withUserId(mockFactory)
            builderMany.build()

            expect(mockFactory).toHaveBeenCalledTimes(3)
            expect(builderMany.build()[0].userId).toBe(userId)
            expect(builderMany.build()[1].userId).toBe(userId)
        })
    })

    describe("email prop", () => {
        const builder = UserDataBuilder.aUser()
        test("should be a function", () => {
            expect(typeof builder["_email"]).toBe("function")
        })

        test("withEmail", () => {
            const $this = builder.withEmail("test@example.com")
            expect($this).toBeInstanceOf(UserDataBuilder)
            expect(builder["_email"]).toBe("test@example.com")

            builder.withEmail(() => "test@example.com")
            //@ts-expect-error email is callable
            expect(builder["_email"]()).toBe("test@example.com")

            expect(builder.email).toBe("test@example.com")
        })

        test("should pass index to email factory", () => {
            builder.withEmail((index) => `test${index}@example.com`)
            const user = builder.build()
            expect(user.email).toBe(`test0@example.com`)

            const builderMany = UserDataBuilder.theUsers(2)
            builderMany.withEmail((index) => `test${index}@example.com`)
            const users = builderMany.build()

            expect(users[0].email).toBe(`test0@example.com`)
            expect(users[1].email).toBe(`test1@example.com`)
        })

        test("invalid email", () => {
            const $this = builder.withInvalidEmail()
            expect($this).toBeInstanceOf(UserDataBuilder)
            expect(builder["_email"]).toBe("not-an-email")
        })
    })

    describe("name prop", () => {
        const builder = UserDataBuilder.aUser()
        test("should be a function", () => {
            expect(typeof builder["_name"]).toBe("function")
        })

        test("withName", () => {
            const $this = builder.withName("John Doe")
            expect($this).toBeInstanceOf(UserDataBuilder)
            expect(builder["_name"]).toBe("John Doe")

            builder.withName(() => "John Doe")
            //@ts-expect-error name is callable
            expect(builder["_name"]()).toBe("John Doe")

            expect(builder.name).toBe("John Doe")
        })

        test("invalid too short case", () => {
            const $this = builder.withInvalidNameTooShort()
            expect($this).toBeInstanceOf(UserDataBuilder)
            expect(builder["_name"].length).toBe(0)
        })

        test("invalid too long case", () => {
            const $this = builder.withInvalidNameTooLong()
            expect($this).toBeInstanceOf(UserDataBuilder)
            expect(builder["_name"].length).toBe(256)
        })
    })

    describe("role prop", () => {
        const builder = UserDataBuilder.aUser()
        test("should be a function", () => {
            expect(typeof builder["_role"]).toBe("function")
        })

        test("withRole", () => {
            const $this = builder.withRole(Role.ADMIN)
            expect($this).toBeInstanceOf(UserDataBuilder)
            expect(builder["_role"]).toBe(Role.ADMIN)

            builder.withRole(() => Role.ADMIN)
            //@ts-expect-error role is callable
            expect(builder["_role"]()).toBe(Role.ADMIN)

            expect(builder.role).toBe(Role.ADMIN)
        })

        test("invalid role", () => {
            const $this = builder.withInvalidRole()
            expect($this).toBeInstanceOf(UserDataBuilder)
            expect(builder["_role"]).toBe("invalid-role")
        })
    })

    describe("build method", () => {
        const builder = UserDataBuilder.aUser()
        test("should return a user", () => {
            const user = builder.build()
            expect(user).toBeInstanceOf(User)
            expect(user.userId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            )
            expect(user.email).toBeDefined()
            expect(user.name).toBeDefined()
            expect(user.role).toBeDefined()
        })

        test("theUsers should return many users", () => {
            const builderMany = UserDataBuilder.theUsers(2)
            const users = builderMany.build()

            expect(users).toHaveLength(2)
            expect(users[0]).toBeInstanceOf(User)
            expect(users[1]).toBeInstanceOf(User)
            expect(users[0]).not.toEqual(users[1])
        })
    })
})
