import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UserList } from "../user-list"
import { UserListDataBuilder } from "../users-list-data-builder"
import { UserListValidator } from "../user-list.validator"
import { UserListItem } from "../user-list-item"

describe("UserListValidator Unit Tests", () => {
    let validator: UserListValidator
    let builder: UserListDataBuilder<UserList>

    beforeEach(() => {
        validator = new UserListValidator()
        builder = UserListDataBuilder.aUserList()
    })

    it("should not throw an error for a valid user list", () => {
        const validUserList = builder.build()
        expect(() => validator.validate(validUserList)).not.toThrow()
    })

    describe("should throw validation error", () => {
        const arrange = [
            {
                label: "userListId invalid",
                mutator: (props: UserList) =>
                    (props.userListId = "invalid-uuid"),
                expected: "Invalid UUID for userListId.",
            },
            {
                label: "serviceId invalid",
                mutator: (props: UserList) =>
                    (props.serviceId = "invalid-uuid"),
                expected: "Invalid UUID for serviceId.",
            },
            {
                label: "usersNumber is zero",
                mutator: (props: UserList) => (props.usersNumber = 0),
                expected: "User number must be at least 1.",
            },
            {
                label: "items is empty",
                mutator: (props: UserList) => (props.items = []),
                expected: "At least one user is required.",
            },
            {
                label: "item name too short",
                mutator: (props: UserList) => (props.items[0].name = ""),
                expected: "Name is required.",
            },
            {
                label: "item name too long",
                mutator: (props: UserList) =>
                    (props.items[0].name = "a".repeat(51)),
                expected: "Name must be 50 characters or less.",
            },
            {
                label: "item email invalid",
                mutator: (props: UserList) =>
                    (props.items[0].email = "invalid-email"),
                expected: "Invalid email address.",
            },
            {
                label: "item corpUserId too short",
                mutator: (props: UserList) => (props.items[0].corpUserId = ""),
                expected: "Corp User ID is required.",
            },
            {
                label: "item corpUserId too long",
                mutator: (props: UserList) =>
                    (props.items[0].corpUserId = "a".repeat(9)),
                expected: "Corp User ID must be 8 characters or less.",
            },
            {
                label: "item area too short",
                mutator: (props: UserList) => (props.items[0].area = ""),
                expected: "Area is required.",
            },
            {
                label: "item area too long",
                mutator: (props: UserList) =>
                    (props.items[0].area = "a".repeat(16)),
                expected: "Area must be 15 characters or less.",
            },
            {
                label: "item costCenter invalid length",
                mutator: (props: UserList) =>
                    (props.items[0].costCenter = "12345"),
                expected: "Cost Center must be 9 characters.",
            },
        ]

        test.each(arrange)("for $label", ({ mutator, expected }) => {
            const userList = builder.build()
            mutator(userList)
            expect(() => validator.validate(userList)).toThrow(
                new ValidationError(expected),
            )
        })
    })

    describe("should throw validation error for null or undefined properties", () => {
        const arrange = [
            {
                label: "userListId null",
                mutator: (props: UserList) =>
                    (props.userListId = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "userListId undefined",
                mutator: (props: UserList) =>
                    (props.userListId = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "serviceId null",
                mutator: (props: UserList) =>
                    (props.serviceId = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "serviceId undefined",
                mutator: (props: UserList) =>
                    (props.serviceId = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "usersNumber null",
                mutator: (props: UserList) =>
                    (props.usersNumber = null as unknown as number),
                expected: "Expected number, received null.",
            },
            {
                label: "usersNumber undefined",
                mutator: (props: UserList) =>
                    (props.usersNumber = undefined as unknown as number),
                expected: "Required.",
            },
            {
                label: "items null",
                mutator: (props: UserList) =>
                    (props.items = null as unknown as UserListItem[]),
                expected: "Expected array, received null.",
            },
            {
                label: "items undefined",
                mutator: (props: UserList) =>
                    (props.items = undefined as unknown as UserListItem[]),
                expected: "Required.",
            },
        ]

        test.each(arrange)("for $label", ({ mutator, expected }) => {
            const userList = builder.build()
            mutator(userList)
            expect(() => validator.validate(userList)).toThrow(
                new ValidationError(expected),
            )
        })
    })
})
