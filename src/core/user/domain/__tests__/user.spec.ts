import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { Role } from "../role"
import { User } from "../user"
import { UserDataBuilder } from "../user-data-builder"

describe("User Unit Tests", () => {
    let builder: UserDataBuilder<User>

    beforeEach(() => {
        builder = UserDataBuilder.aUser()
    })

    describe("create method", () => {
        it("should create a user", () => {
            const props = {
                email: builder.email,
                name: builder.name,
                role: builder.role,
            }
            const user = User.create(props)
            user.validate()
            expect(user.userId).toBeDefined()
            expect(user.userId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            )
            expect(user.email).toBe(props.email.toLowerCase())
            expect(user.name).toBe(props.name)
            expect(user.role).toBe(props.role)
        })
    })

    describe("change methods", () => {
        it("should change email", () => {
            const user = builder.build()
            const newEmail = "new@example.com"
            user.changeEmail(newEmail)
            user.validate()
            expect(user.email).toBe(newEmail)
        })

        it("should change name", () => {
            const user = builder.build()
            const newName = "new name"
            user.changeName(newName)
            user.validate()
            expect(user.name).toBe(newName)
        })

        it("should change role", () => {
            const user = builder.build()
            const newRole = Role.ADMIN
            user.changeRole(newRole)
            user.validate()
            expect(user.role).toBe(newRole)
        })
    })

    describe("validation", () => {
        const arrange = [
            {
                label: "invalid email",
                builder: () => builder.withInvalidEmail(),
                expected: "Invalid email.",
            },
            {
                label: "name too short",
                builder: () => builder.withInvalidNameTooShort(),
                expected: "Name is required.",
            },
            {
                label: "name too long",
                builder: () => builder.withInvalidNameTooLong(),
                expected: "Name must be 50 characters or less.",
            },
            {
                label: "invalid role",
                builder: () => builder.withInvalidRole(),
                expected: "Invalid role.",
            },
        ]

        test.each(arrange)(
            "should throw validation error for $label",
            ({ builder, expected }) => {
                expect(() => builder().build()).toThrow(
                    new ValidationError(expected),
                )
            },
        )
    })

    describe("toJSON method", () => {
        it("should return a JSON representation of the user", () => {
            const user = builder.build()
            const json = user.toJSON()
            expect(json).toEqual({
                userId: user.userId,
                email: user.email,
                name: user.name,
                role: user.role,
            })
        })
    })
})
