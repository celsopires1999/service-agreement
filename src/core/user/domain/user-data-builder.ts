import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { Chance } from "chance"
import { Role, RoleType } from "./role"
import { User } from "./user"

type PropOrFactory<T> = T | ((index: number) => T)

export class UserDataBuilder<TBuild = unknown> {
    private _userId: PropOrFactory<string> | undefined = undefined
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _email: PropOrFactory<string> = (_index) => this.chance.email()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _name: PropOrFactory<string> = (_index) => this.chance.name()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _role: PropOrFactory<RoleType> = (_index) =>
        this.chance.pickone(Object.values(Role))

    private countObjs: number

    static aUser() {
        return new UserDataBuilder<User>()
    }

    static theUsers(countObjs: number) {
        return new UserDataBuilder<User[]>(countObjs)
    }

    private chance: Chance.Chance

    private constructor(countObjs: number = 1) {
        this.countObjs = countObjs
        this.chance = Chance()
    }

    withUserId(valueOrFactory: PropOrFactory<string>) {
        this._userId = valueOrFactory
        return this
    }
    withEmail(valueOrFactory: PropOrFactory<string>) {
        this._email = valueOrFactory
        return this
    }
    withName(valueOrFactory: PropOrFactory<string>) {
        this._name = valueOrFactory
        return this
    }
    withRole(valueOrFactory: PropOrFactory<RoleType>) {
        this._role = valueOrFactory
        return this
    }

    withInvalidEmail() {
        this._email = "not-an-email"
        return this
    }

    withInvalidNameTooShort() {
        this._name = ""
        return this
    }

    withInvalidNameTooLong(value?: string) {
        this._name = value ?? this.chance.string({ length: 256 })
        return this
    }

    withInvalidRole() {
        this._role = "invalid-role" as RoleType
        return this
    }

    build(): TBuild {
        const users = new Array(this.countObjs)
            .fill(undefined)
            .map((_, index) => {
                const user = new User({
                    userId: this._userId
                        ? this.callFactory(this._userId, index)
                        : new Uuid().toString(),
                    email: this.callFactory(this._email, index),
                    name: this.callFactory(this._name, index),
                    role: this.callFactory(this._role, index),
                })
                user.validate()
                return user
            })
        return this.countObjs === 1
            ? (users[0] as unknown as TBuild)
            : (users as unknown as TBuild)
    }

    get userId(): string {
        return this.getValue("userId")
    }
    get email(): string {
        return this.getValue("email")
    }
    get name(): string {
        return this.getValue("name")
    }
    get role(): RoleType {
        return this.getValue("role")
    }

    private getValue(prop: keyof User) {
        const optional = ["userId"]
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
