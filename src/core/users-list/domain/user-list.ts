import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { UserListItem, UserListItemCreateCommand } from "./user-list-item"

export type UserListContructorProps = {
    userListId: string
    serviceId: string
    usersNumber: number
    items: UserListItem[]
}

export type UserListCreateCommand = Omit<
    UserListContructorProps,
    "userListId" | "usersNumber"
>

export class UserList {
    userListId: string
    serviceId: string
    usersNumber: number
    items: UserListItem[]

    constructor(props: UserListContructorProps) {
        this.userListId = props.userListId
        this.serviceId = props.serviceId
        this.usersNumber = props.usersNumber
        this.items = props.items
    }

    static create(props: UserListCreateCommand) {
        return new UserList({
            ...props,
            userListId: new Uuid().toString(),
            usersNumber: 0,
            items: [],
        })
    }

    changeUsersNumber(newUsersNumber: number) {
        this.usersNumber = newUsersNumber
    }

    addItem(item: UserListItemCreateCommand) {
        this.items.push(UserListItem.create(item))
        this.usersNumber = this.items.length
    }

    removeItem(userListItemId: string) {
        this.items = this.items.filter(
            (i) => i.userListItemId !== userListItemId,
        )
        this.usersNumber = this.items.length
    }
}
