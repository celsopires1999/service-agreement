import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { Chance } from "chance"
import { System } from "./system"

type PropOrFactory<T> = T | ((index: number) => T)

export class SystemDataBuilder<TBuild = unknown> {
    private _systemId: PropOrFactory<string> | undefined = undefined
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _name: PropOrFactory<string> = (_index) =>
        this.chance.string({
            length: 30,
            pool: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _description: PropOrFactory<string> = (_index) =>
        this.chance.sentence({ words: 5 })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _applicationId: PropOrFactory<string> = (_index) =>
        this.chance.string({ length: 10 })

    private countObjs: number

    static aSystem() {
        return new SystemDataBuilder<System>()
    }

    static theSystems(countObjs: number) {
        return new SystemDataBuilder<System[]>(countObjs)
    }

    private chance: Chance.Chance

    private constructor(countObjs: number = 1) {
        this.countObjs = countObjs
        this.chance = Chance()
    }

    withSystemId(valueOrFactory: PropOrFactory<string>) {
        this._systemId = valueOrFactory
        return this
    }
    withName(valueOrFactory: PropOrFactory<string>) {
        this._name = valueOrFactory
        return this
    }
    withDescription(valueOrFactory: PropOrFactory<string>) {
        this._description = valueOrFactory
        return this
    }
    withApplicationId(valueOrFactory: PropOrFactory<string>) {
        this._applicationId = valueOrFactory
        return this
    }

    withInvalidNameTooShort() {
        this._name = ""
        return this
    }

    withInvalidNameTooLong(value?: string) {
        this._name = value ?? this.chance.string({ length: 51 })
        return this
    }

    withInvalidDescriptionTooShort() {
        this._description = ""
        return this
    }

    withInvalidDescriptionTooLong(value?: string) {
        this._description = value ?? this.chance.string({ length: 501 })
        return this
    }

    withInvalidApplicationIdTooShort() {
        this._applicationId = ""
        return this
    }

    withInvalidApplicationIdTooLong(value?: string) {
        this._applicationId = value ?? this.chance.string({ length: 21 })
        return this
    }

    build(): TBuild {
        const systems = new Array(this.countObjs)
            .fill(undefined)
            .map((_, index) => {
                const system = new System({
                    systemId: this._systemId
                        ? this.callFactory(this._systemId, index)
                        : new Uuid().toString(),
                    name: this.callFactory(this._name, index),
                    description: this.callFactory(this._description, index),
                    applicationId: this.callFactory(this._applicationId, index),
                })
                system.validate()
                return system
            })
        return this.countObjs === 1
            ? (systems[0] as unknown as TBuild)
            : (systems as unknown as TBuild)
    }

    get systemId(): string {
        return this.getValue("systemId")
    }
    get name(): string {
        return this.getValue("name")
    }
    get description(): string {
        return this.getValue("description")
    }
    get applicationId(): string {
        return this.getValue("applicationId")
    }

    private getValue(prop: keyof System) {
        const optional = ["systemId"]
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
