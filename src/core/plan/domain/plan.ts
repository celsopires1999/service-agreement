import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import Decimal from "decimal.js"
import { PlanValidator } from "./plan.validator"

export type PlanConstructorProps = {
    planId: string
    code: string
    description: string
    euro: string
    planDate: string
}

export type PlanCreateCommand = Omit<PlanConstructorProps, "planId">

export class Plan {
    planId: string
    code: string
    description: string
    euro: string
    planDate: string

    constructor(props: PlanConstructorProps) {
        this.planId = props.planId
        this.code = props.code
        this.description = props.description
        this.euro = props.euro
        this.planDate = props.planDate
    }

    static create(props: PlanCreateCommand) {
        return new Plan({
            ...props,
            planId: new Uuid().toString(),
        })
    }

    changeCode(code: string) {
        this.code = code
    }

    changeDescription(description: string) {
        this.description = description
    }

    changeEuro(euro: string) {
        this.euro = euro
    }

    changePlanDate(planDate: string) {
        this.planDate = planDate
    }

    validate() {
        const validator = new PlanValidator()
        validator.validate(this)
    }

    compareEuro(otherEuro: string): number {
        const thisEuro = new Decimal(this.euro)
        const thatEuro = new Decimal(otherEuro)
        return thisEuro.cmp(thatEuro)
    }

    toJSON() {
        return {
            planId: this.planId,
            code: this.code,
            description: this.description,
            euro: new Decimal(this.euro).toFixed(4).toString(),
            planDate: this.planDate,
        }
    }
}
