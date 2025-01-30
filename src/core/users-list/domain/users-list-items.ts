import { v4 as uuidv4 } from "uuid"

export type UsersListItemContructorProps = {
    usersListItemId: string
    name: string
    email: string
    corpUserId: string
    area: string
    costCenter: string
}

export type UsersListItemCreateCommand = Omit<
    UsersListItemContructorProps,
    "usersListItemId"
>

export class UsersListItem {
    usersListItemId: string
    name: string
    email: string
    corpUserId: string
    area: string
    costCenter: string
    constructor(props: UsersListItemContructorProps) {
        this.usersListItemId = props.usersListItemId
        this.name = props.name.trim()
        this.email = props.email.trim().toLowerCase()
        this.corpUserId = props.corpUserId.trim()
        this.area = props.area.trim()
        this.costCenter = props.costCenter.trim()
    }

    static create(props: UsersListItemCreateCommand) {
        return new UsersListItem({
            ...props,
            usersListItemId: uuidv4(),
        })
    }

    changeName(name: string) {
        this.name = name.trim()
    }

    changeEmail(email: string) {
        this.email = email.trim().toLowerCase()
    }

    changeCorpUserId(corpUserId: string) {
        this.corpUserId = corpUserId.trim()
    }

    changeArea(area: string) {
        this.area = area.trim()
    }

    changeCostCenter(costCenter: string) {
        this.costCenter = costCenter.trim()
    }
}
