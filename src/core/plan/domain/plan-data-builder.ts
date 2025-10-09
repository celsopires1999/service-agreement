import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { Chance } from "chance"
import { Plan } from "./plan"

type PropOrFactory<T> = T | ((index: number) => T)

export class PlanDataBuilder<TBuild = unknown> {
    private _planId: PropOrFactory<string> | undefined = undefined
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _code: PropOrFactory<string> = (_index) =>
        this.chance.string({
            length: 10,
            pool: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _description: PropOrFactory<string> = (_index) =>
        this.chance.sentence({ words: 5 })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _euro: PropOrFactory<string> = (_index) =>
        this.chance.floating({ min: 0.0001, max: 10000, fixed: 4 }).toString()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _planDate: PropOrFactory<string> = (_index) =>
        new Date(this.chance.date({ year: 2024 })).toISOString().split("T")[0]

    private readonly countObjs: number

    static aPlan() {
        return new PlanDataBuilder<Plan>()
    }

    static thePlans(countObjs: number) {
        return new PlanDataBuilder<Plan[]>(countObjs)
    }

    private readonly chance: Chance.Chance

    private constructor(countObjs: number = 1) {
        this.countObjs = countObjs
        this.chance = Chance()
    }

    withPlanId(valueOrFactory: PropOrFactory<string>) {
        this._planId = valueOrFactory
        return this
    }
    withCode(valueOrFactory: PropOrFactory<string>) {
        this._code = valueOrFactory
        return this
    }
    withDescription(valueOrFactory: PropOrFactory<string>) {
        this._description = valueOrFactory
        return this
    }
    withEuro(valueOrFactory: PropOrFactory<string>) {
        this._euro = valueOrFactory
        return this
    }
    withPlanDate(valueOrFactory: PropOrFactory<string>) {
        this._planDate = valueOrFactory
        return this
    }

    withInvalidCodeTooShort() {
        this._code = ""
        return this
    }

    withInvalidCodeTooLong(value?: string) {
        this._code = value ?? this.chance.string({ length: 21 })
        return this
    }

    withInvalidDescriptionTooShort() {
        this._description = ""
        return this
    }

    withInvalidDescriptionTooLong(value?: string) {
        this._description = value ?? this.chance.string({ length: 256 })
        return this
    }

    withInvalidEuro() {
        this._euro = "not a decimal"
        return this
    }

    withInvalidEuroTooManyDecimals() {
        this._euro = "1.12345"
        return this
    }

    withInvalidPlanDate() {
        this._planDate = "invalid date"
        return this
    }

    build(): TBuild {
        const plans = new Array(this.countObjs)
            .fill(undefined)
            .map((_, index) => {
                const plan = new Plan({
                    planId: this._planId
                        ? this.callFactory(this._planId, index)
                        : new Uuid().toString(),
                    code: this.callFactory(this._code, index),
                    description: this.callFactory(this._description, index),
                    euro: this.callFactory(this._euro, index),
                    planDate: this.callFactory(this._planDate, index),
                })
                plan.validate()
                return plan
            })
        return this.countObjs === 1
            ? (plans[0] as unknown as TBuild)
            : (plans as unknown as TBuild)
    }

    get planId(): string {
        return this.getValue("planId")
    }
    get code(): string {
        return this.getValue("code")
    }
    get description(): string {
        return this.getValue("description")
    }
    get euro(): string {
        return this.getValue("euro")
    }
    get planDate(): string {
        return this.getValue("planDate")
    }

    private getValue(prop: keyof Plan) {
        const optional = ["planId"]
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
