import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { UserList } from "../user-list"
import { UserListDataBuilder } from "../users-list-data-builder"
import { UserListItem } from "../user-list-item"

describe("UserListDataBuilder Unit Tests", () => {
    describe("userListId prop", () => {
        const builder = UserListDataBuilder.aUserList()
        test("should throw error when any with methods has called", () => {
            expect(() => builder.userListId).toThrow(
                new Error(
                    `Property userListId does not have a factory, use "with" method instead`,
                ),
            )
        })

        test("should be undefined", () => {
            expect(builder["_userListId"]).toBeUndefined()
        })

        test("withUserListId", () => {
            const userListId = new Uuid().toString()
            const $this = builder.withUserListId(userListId)
            expect($this).toBeInstanceOf(UserListDataBuilder)
            expect(builder["_userListId"]).toBe(userListId)

            builder.withUserListId(() => userListId)
            //@ts-expect-error _userListId is a callable
            expect(builder["_userListId"]()).toBe(userListId)

            expect(builder.userListId).toBe(userListId)
        })

        test("should pass index to userListId factory", () => {
            const userListId = new Uuid().toString()
            const mockFactory = jest.fn(() => userListId)
            builder.withUserListId(mockFactory)
            builder.build()
            expect(mockFactory).toHaveBeenCalledTimes(1)

            const builderMany = UserListDataBuilder.theUserLists(2)
            builderMany.withUserListId(mockFactory)
            builderMany.build()

            expect(mockFactory).toHaveBeenCalledTimes(3)
            expect(builderMany.build()[0].userListId).toBe(userListId)
            expect(builderMany.build()[1].userListId).toBe(userListId)
        })
    })

    describe("serviceId prop", () => {
        const builder = UserListDataBuilder.aUserList()
        test("should be a function", () => {
            expect(typeof builder["_serviceId"]).toBe("function")
        })

        test("withServiceId", () => {
            const serviceId = new Uuid().toString()
            const $this = builder.withServiceId(serviceId)
            expect($this).toBeInstanceOf(UserListDataBuilder)
            expect(builder["_serviceId"]).toBe(serviceId)

            builder.withServiceId(() => serviceId)
            //@ts-expect-error _serviceId is a callable
            expect(builder["_serviceId"]()).toBe(serviceId)

            expect(builder.serviceId).toBe(serviceId)
        })
    })

    describe("usersNumber prop", () => {
        const builder = UserListDataBuilder.aUserList()
        test("should be a function", () => {
            expect(typeof builder["_usersNumber"]).toBe("function")
        })

        test("withUsersNumber", () => {
            const $this = builder.withUsersNumber(5)
            expect($this).toBeInstanceOf(UserListDataBuilder)
            expect(builder["_usersNumber"]).toBe(5)

            builder.withUsersNumber(() => 5)
            //@ts-expect-error _usersNumber is a callable
            expect(builder["_usersNumber"]()).toBe(5)

            expect(builder.usersNumber).toBe(5)
        })
    })

    describe("items prop", () => {
        const builder = UserListDataBuilder.aUserList()
        test("should be a function", () => {
            expect(typeof builder["_items"]).toBe("function")
        })

        test("withItems", () => {
            const items = [
                UserListItem.create({
                    name: "test",
                    email: "test@test.com",
                    corpUserId: "test",
                    area: "test",
                    costCenter: "123456789",
                }),
            ]
            const $this = builder.withItems(items)
            expect($this).toBeInstanceOf(UserListDataBuilder)
            expect(builder["_items"]).toBe(items)

            builder.withItems(() => items)
            //@ts-expect-error _items is a callable
            expect(builder["_items"]()).toBe(items)

            expect(builder.items).toBe(items)
        })
    })

    describe("build method", () => {
        const builder = UserListDataBuilder.aUserList()
        test("should return a user list", () => {
            const userList = builder.build()
            expect(userList).toBeInstanceOf(UserList)
            expect(userList.userListId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            )
            expect(userList.serviceId).toBeDefined()
            expect(userList.usersNumber).toBeDefined()
            expect(userList.items).toBeDefined()
        })

        test("theUserLists should return many user lists", () => {
            const builderMany = UserListDataBuilder.theUserLists(2)
            const userLists = builderMany.build()

            expect(userLists).toHaveLength(2)
            expect(userLists[0]).toBeInstanceOf(UserList)
            expect(userLists[1]).toBeInstanceOf(UserList)
            expect(userLists[0]).not.toEqual(userLists[1])
        })
    })
})
