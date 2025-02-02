import { v4 as uuidv4 } from "uuid"

export type UserListItemContructorProps = {
    userListItemId: string
    name: string
    email: string
    corpUserId: string
    area: string
    costCenter: string
}

export type UserListItemCreateCommand = Omit<
    UserListItemContructorProps,
    "userListItemId"
>

export class UserListItem {
    userListItemId: string
    name: string
    email: string
    corpUserId: string
    area: string
    costCenter: string
    constructor(props: UserListItemContructorProps) {
        this.userListItemId = props.userListItemId
        this.name = props.name.trim()
        this.email = props.email.trim().toLowerCase()
        this.corpUserId = props.corpUserId.trim()
        this.area = props.area.trim()
        this.costCenter = props.costCenter.trim()
    }

    static create(props: UserListItemCreateCommand) {
        return new UserListItem({
            ...props,
            userListItemId: uuidv4(),
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
