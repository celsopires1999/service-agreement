import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import Decimal from "decimal.js"
import { currecyType } from "./service"
import { validateDecimal } from "./utils"

export type ServiceSystemConstructorProps = {
    serviceId: string
    systemId: string
    allocation: string
    runAmount: string
    chgAmount: string
    amount: string
    currency: currecyType
}

export type ServiceSystemCreateCommand = {
    serviceId: string
    systemId: string
    allocation: string
    totalRunAmount: string
    totalChgAmount: string
    currency: currecyType
}

export class ServiceSystem {
    serviceId: string
    systemId: string
    allocation: string
    runAmount: string
    chgAmount: string
    amount: string
    currency: currecyType

    constructor(props: ServiceSystemConstructorProps) {
        this.serviceId = props.serviceId
        this.systemId = props.systemId
        this.allocation = props.allocation
        this.runAmount = props.runAmount
        this.chgAmount = props.chgAmount
        this.amount = props.amount
        this.currency = props.currency
    }
    static create(props: ServiceSystemCreateCommand) {
        const { runAmount, chgAmount, amount } = ServiceSystem.calculateAmount(
            props.totalRunAmount,
            props.totalChgAmount,
            props.allocation,
        )
        return new ServiceSystem({
            serviceId: props.serviceId,
            systemId: props.systemId,
            allocation: props.allocation,
            amount,
            runAmount,
            chgAmount,
            currency: props.currency,
        })
    }

    changeAllocation(
        totalRunAmount: string,
        totalChgAmount: string,
        allocation: string,
    ) {
        const { runAmount, chgAmount, amount } = ServiceSystem.calculateAmount(
            totalRunAmount,
            totalChgAmount,
            allocation,
        )
        this.runAmount = runAmount
        this.chgAmount = chgAmount
        this.amount = amount
        this.allocation = allocation
    }

    changeAmount(totalRunAmount: string, totalChgAmount: string) {
        const { runAmount, chgAmount, amount } = ServiceSystem.calculateAmount(
            totalRunAmount,
            totalChgAmount,
            this.allocation,
        )
        this.runAmount = runAmount
        this.chgAmount = chgAmount
        this.amount = amount
    }

    changeCurrency(currency: currecyType) {
        this.currency = currency
    }

    static calculateAmount(
        totalRunAmount: string,
        totalChgAmount: string,
        allocation: string,
    ) {
        if (!validateDecimal(totalRunAmount, 12, 2)) {
            throw new ValidationError(
                "total run amount to be allocated is not a valid decimal",
            )
        }

        if (!validateDecimal(totalChgAmount, 12, 2)) {
            throw new ValidationError(
                "total change amount to be allocated is not a valid decimal",
            )
        }

        const runAmount = new Decimal(totalRunAmount)
            .mul(new Decimal(allocation).div(100))
            .toFixed(2)

        const chgAmount = new Decimal(totalChgAmount)
            .mul(new Decimal(allocation).div(100))
            .toFixed(2)

        const amount = new Decimal(runAmount).add(chgAmount).toFixed(2)

        return { runAmount, chgAmount, amount }
    }
}
