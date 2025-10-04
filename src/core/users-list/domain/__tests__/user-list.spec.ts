import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UserList } from "../user-list"
import { UserListDataBuilder } from "../users-list-data-builder"
import { UserListItem } from "../user-list-item"
import { Uuid } from "@/core/shared/domain/value-objects/uuid"

describe("UserList Unit Tests", () => {
    let builder: UserListDataBuilder<UserList>

    beforeEach(() => {
        builder = UserListDataBuilder.aUserList()
    })

    describe("create method", () => {
        it("should create a user list", () => {
            const props = {
                serviceId: new Uuid().toString(),
                items: [],
            }
            const userList = UserList.create(props)
            expect(userList.userListId).toBeDefined()
            expect(userList.userListId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            )
            expect(userList.serviceId).toBe(props.serviceId)
            expect(userList.usersNumber).toBe(0)
            expect(userList.items).toEqual([])
        })
    })

    describe("change methods", () => {
        it("should add an item", () => {
            const userList = UserList.create({
                serviceId: new Uuid().toString(),
                items: [],
            })
            const item = {
                name: "test",
                email: "test@test.com",
                corpUserId: "test",
                area: "test",
                costCenter: "123456789",
            }
            userList.addItem(item)
            expect(userList.items.length).toBe(1)
            expect(userList.usersNumber).toBe(1)
            expect(userList.items[0].name).toBe(item.name)
        })

        it("should remove an item", () => {
            const item = UserListItem.create({
                name: "test",
                email: "test@test.com",
                corpUserId: "test",
                area: "test",
                costCenter: "123456789",
            })
            const userList = builder.withItems([item]).build()
            userList.removeItem(item.userListItemId)
            expect(userList.items.length).toBe(0)
            expect(userList.usersNumber).toBe(0)
        })
    })

    describe("validation", () => {
        const arrange = [
            {
                label: "usersNumber less than 1",
                builder: () => builder.withInvalidUsersNumber(),
                expected:
                    "User number must be at least 1. At least one user is required.",
            },
            {
                label: "items empty",
                builder: () => builder.withInvalidItems(),
                expected:
                    "User number must be at least 1. At least one user is required.",
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
        it("should return a JSON representation of the user list", () => {
            const userList = builder.build()
            userList.addItem({
                name: "test",
                email: "test@test.com",
                corpUserId: "test",
                area: "test",
                costCenter: "123456789",
            })
            const json = userList.toJSON()
            expect(userList.items.length).toBe(11)
            expect(json).toEqual({
                userListId: userList.userListId,
                serviceId: userList.serviceId,
                usersNumber: userList.usersNumber,
                items: userList.items,
            })
        })
    })
})
