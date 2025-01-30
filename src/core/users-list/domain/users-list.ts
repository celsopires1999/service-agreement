import { v4 as uuidv4 } from "uuid"
import { UsersListItem, UsersListItemCreateCommand } from "./users-list-items"

export type UsersListContructorProps = {
    usersListId: string
    systemId: string
    year: number
    revision: number
    revisionDate: string
    isRevised: boolean
    localPlanId: string
    usersNumber: number
    items: UsersListItem[]
}

export type UsersListCreateCommand = Omit<
    UsersListContructorProps,
    "userListId" | "usersNumber"
>

export class UsersList {
    usersListId: string
    systemId: string
    year: number
    revision: number
    revisionDate: string
    isRevised: boolean
    localPlanId: string
    usersNumber: number
    items: UsersListItem[]

    constructor(props: UsersListContructorProps) {
        this.usersListId = props.usersListId
        this.systemId = props.systemId
        this.year = props.year
        this.revision = props.revision
        this.revisionDate = props.revisionDate
        this.isRevised = props.isRevised
        this.localPlanId = props.localPlanId
        this.usersNumber = props.usersNumber
        this.items = props.items
    }

    static create(props: UsersListCreateCommand) {
        return new UsersList({
            ...props,
            usersListId: uuidv4(),
            usersNumber: 0,
            items: [],
        })
    }

    changeYear(newYear: number) {
        this.year = newYear
    }

    changeRevision(newRevision: number) {
        this.revision = newRevision
    }

    changeRevisionDate(newRevisionDate: string) {
        this.revisionDate = newRevisionDate
    }

    changeIsRevised(newIsRevised: boolean) {
        this.isRevised = newIsRevised
    }

    changeLocalPlanId(newLocalPlanId: string) {
        this.localPlanId = newLocalPlanId
    }

    changeUsersNumber(newUsersNumber: number) {
        this.usersNumber = newUsersNumber
    }

    addItem(item: UsersListItemCreateCommand) {
        this.items.push(UsersListItem.create(item))
        this.usersNumber = this.items.length
    }

    removeItem(usersListItemId: string) {
        this.items = this.items.filter(
            (i) => i.usersListItemId !== usersListItemId,
        )
        this.usersNumber = this.items.length
    }
}
