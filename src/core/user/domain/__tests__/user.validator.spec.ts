import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { RoleType } from "../role"
import { User } from "../user"
import { UserDataBuilder } from "../user-data-builder"
import { UserValidator } from "../user.validator"

describe("UserValidator Unit Tests", () => {
    let validator: UserValidator
    let builder: UserDataBuilder<User>

    beforeEach(() => {
        validator = new UserValidator()
        builder = UserDataBuilder.aUser()
    })

    it("should not throw an error for a valid user", () => {
        const validUser = builder.build()
        expect(() => validator.validate(validUser)).not.toThrow()
    })

    describe("should throw validation error", () => {
        const arrange = [
            {
                label: "userId invalid",
                mutator: (props: User) => (props.userId = "invalid-uuid"),
                expected: "Invalid UUID for userId.",
            },
            {
                label: "email empty",
                mutator: (props: User) => (props.email = ""),
                expected: "Email is required. Invalid email.",
            },
            {
                label: "email invalid",
                mutator: (props: User) => (props.email = "invalid-email"),
                expected: "Invalid email.",
            },
            {
                label: "name empty",
                mutator: (props: User) => (props.name = ""),
                expected: "Name is required.",
            },
            {
                label: "name too long",
                mutator: (props: User) => (props.name = "a".repeat(51)),
                expected: "Name must be 50 characters or less.",
            },
            {
                label: "invalid role",
                mutator: (props: User) =>
                    (props.role = "INVALID_ROLE" as RoleType),
                expected: "Invalid role.",
            },
        ]

        test.each(arrange)("for $label", ({ mutator, expected }) => {
            const user = builder.build()
            mutator(user)
            expect(() => validator.validate(user)).toThrow(
                new ValidationError(expected),
            )
        })
    })

    describe("should throw validation error for null or undefined properties", () => {
        const arrange = [
            {
                label: "userId null",
                mutator: (props: User) =>
                    (props.userId = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "userId undefined",
                mutator: (props: User) =>
                    (props.userId = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "email null",
                mutator: (props: User) =>
                    (props.email = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "email undefined",
                mutator: (props: User) =>
                    (props.email = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "name null",
                mutator: (props: User) =>
                    (props.name = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "name undefined",
                mutator: (props: User) =>
                    (props.name = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "role null",
                mutator: (props: User) =>
                    (props.role = null as unknown as RoleType),
                expected: "Invalid role.",
            },
            {
                label: "role undefined",
                mutator: (props: User) =>
                    (props.role = undefined as unknown as RoleType),
                expected: "Invalid role.",
            },
        ]

        test.each(arrange)("for $label", ({ mutator, expected }) => {
            const user = builder.build()
            mutator(user)
            expect(() => validator.validate(user)).toThrow(
                new ValidationError(expected),
            )
        })
    })
})
