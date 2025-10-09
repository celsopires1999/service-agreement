import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { Chance } from "chance"
import { UserList } from "./user-list"
import { UserListItem } from "./user-list-item"

type PropOrFactory<T> = T | ((index: number) => T)

export class UserListDataBuilder<TBuild = unknown> {
    private _userListId: PropOrFactory<string> | undefined = undefined
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _serviceId: PropOrFactory<string> = (_index) =>
        new Uuid().toString()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _usersNumber: PropOrFactory<number> = (_index) => 1
    private usersNumberIsSet = false
    private _items: PropOrFactory<UserListItem[]> = (index) => {
        const usersNumber = this.usersNumberIsSet
            ? this.callFactory(this._usersNumber, index)
            : 10
        const items = []
        for (let i = 0; i < usersNumber; i++) {
            items.push(
                new UserListItem({
                    userListItemId: new Uuid().toString(),
                    name: this.chance.name(),
                    email: this.chance.email(),
                    corpUserId: this.chance.string({ length: 8 }),
                    area: this.chance.string({ length: 10 }),
                    costCenter: this.chance.string({ length: 9 }),
                }),
            )
        }
        return items
    }

    private readonly countObjs: number

    static aUserList() {
        return new UserListDataBuilder<UserList>()
    }

    static theUserLists(countObjs: number) {
        return new UserListDataBuilder<UserList[]>(countObjs)
    }

    private readonly chance: Chance.Chance

    private constructor(countObjs: number = 1) {
        this.countObjs = countObjs
        this.chance = Chance()
    }

    withUserListId(valueOrFactory: PropOrFactory<string>) {
        this._userListId = valueOrFactory
        return this
    }

    withServiceId(valueOrFactory: PropOrFactory<string>) {
        this._serviceId = valueOrFactory
        return this
    }

    withUsersNumber(valueOrFactory: PropOrFactory<number>) {
        this._usersNumber = valueOrFactory
        this.usersNumberIsSet = true
        return this
    }

    withItems(valueOrFactory: PropOrFactory<UserListItem[]>) {
        this._items = valueOrFactory
        return this
    }

    withInvalidUsersNumber() {
        this._usersNumber = 0
        this.usersNumberIsSet = true
        return this
    }

    withInvalidItems() {
        this._items = []
        return this
    }

    build(): TBuild {
        const userLists = new Array(this.countObjs)
            .fill(undefined)
            .map((_, index) => {
                const items = this.callFactory(this._items, index)
                const userList = new UserList({
                    userListId: this._userListId
                        ? this.callFactory(this._userListId, index)
                        : new Uuid().toString(),
                    serviceId: this.callFactory(this._serviceId, index),
                    usersNumber: items.length,
                    items: items,
                })
                userList.validate()
                return userList
            })
        return this.countObjs === 1
            ? (userLists[0] as unknown as TBuild)
            : (userLists as unknown as TBuild)
    }

    get userListId(): string {
        return this.getValue("userListId")
    }

    get serviceId(): string {
        return this.getValue("serviceId")
    }

    get usersNumber(): number {
        return this.getValue("usersNumber")
    }

    get items(): UserListItem[] {
        return this.getValue("items")
    }

    private getValue(prop: keyof UserList) {
        const optional = ["userListId"]
        const privateProp = `_${prop}` as keyof this
        if (!this[privateProp] && optional.includes(prop)) {
            throw new Error(
                `Property ${prop} does not have a factory, use "with" method instead`,
            )
        }
        return this.callFactory(this[privateProp], 0)
    }

    private callFactory(factoryOrValue: PropOrFactory<unknown>, index: number) {
        return typeof factoryOrValue === "function"
            ? factoryOrValue(index)
            : factoryOrValue
    }
}
