import Decimal from "decimal.js"
import { validateDecimal } from "./utils"
import { currecyType } from "./service"

export type ServiceSystemConstructorProps = {
    serviceId: string
    systemId: string
    allocation: string
    amount: string
    currency: currecyType
}

export type ServiceSystemCreateCommand = {
    serviceId: string
    systemId: string
    allocation: string
    totalAmount: string
    currency: currecyType
}

export class ServiceSystem {
    serviceId: string
    systemId: string
    allocation: string
    amount: string
    currency: currecyType

    constructor(props: ServiceSystemConstructorProps) {
        this.serviceId = props.serviceId
        this.systemId = props.systemId
        this.allocation = props.allocation
        this.amount = props.amount
        this.currency = props.currency
    }
    static create(props: ServiceSystemCreateCommand) {
        const amount = ServiceSystem.calculateAmount(
            props.totalAmount,
            props.allocation,
        )
        return new ServiceSystem({
            serviceId: props.serviceId,
            systemId: props.systemId,
            allocation: props.allocation,
            currency: props.currency,
            amount,
        })
    }

    changeCurrency(currency: currecyType) {
        this.currency = currency
    }

    changeAmount(totalAmount: string) {
        const amount = ServiceSystem.calculateAmount(
            totalAmount,
            this.allocation,
        )
        this.amount = amount
    }

    static calculateAmount(totalAmount: string, allocation: string) {
        if (!validateDecimal(totalAmount, 12, 2)) {
            throw new Error(
                "total amount to be allocated is not a valid decimal",
            )
        }

        const amount = new Decimal(totalAmount)
            .mul(new Decimal(allocation).div(100))
            .toFixed(2)

        return amount
    }
}
