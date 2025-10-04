import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { UserValidator } from "./user.validator"
import { RoleType } from "./role"

export type UserConstructorProps = {
    userId: string
    email: string
    name: string
    role: RoleType
}

export type UserCreateCommand = Omit<UserConstructorProps, "userId">

export class User {
    userId: string
    email: string
    name: string
    role: RoleType

    constructor(props: UserConstructorProps) {
        this.userId = props.userId
        this.email = props.email.trim().toLowerCase()
        this.name = props.name.trim()
        this.role = props.role
    }

    static create(props: UserCreateCommand): User {
        return new User({
            ...props,
            userId: new Uuid().toString(),
        })
    }

    changeEmail(email: string): void {
        this.email = email.trim().toLowerCase()
    }

    changeName(name: string): void {
        this.name = name.trim()
    }
    changeRole(role: RoleType): void {
        this.role = role
    }

    validate(): void {
        const validator = new UserValidator()
        validator.validate(this)
    }

    toJSON() {
        return {
            userId: this.userId,
            email: this.email,
            name: this.name,
            role: this.role.toString(),
        }
    }
}
