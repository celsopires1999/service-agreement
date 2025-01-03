import { v4 as uuidv4 } from "uuid"
import { ServiceSystem } from "./serviceSystems"
import Decimal from "decimal.js"
import { toDecimal } from "@/lib/utils"

export type currecyType = "EUR" | "USD"

export type ServiceConstructorProps = {
    serviceId: string
    agreementId: string
    name: string
    description: string
    amount: string
    currency: currecyType
    responsibleEmail: string
    isActive: boolean
    serviceSystems?: ServiceSystem[]
}

export type ServiceCreateCommand = Omit<ServiceConstructorProps, "serviceId">

export class Service {
    serviceId: string
    agreementId: string
    name: string
    description: string
    amount: string
    currency: currecyType
    responsibleEmail: string
    isActive: boolean
    serviceSystems: ServiceSystem[]

    constructor(props: ServiceConstructorProps) {
        this.serviceId = props.serviceId
        this.agreementId = props.agreementId.trim()
        this.name = props.name.trim()
        this.description = props.description.trim()
        this.amount = props.amount
        this.currency = props.currency
        this.responsibleEmail = props.responsibleEmail.trim().toLowerCase()
        this.isActive = props.isActive
        this.serviceSystems = props.serviceSystems ?? []
    }

    static create(props: ServiceCreateCommand) {
        const service = new Service({
            serviceId: uuidv4(),
            ...props,
        })

        return service
    }

    changeName(name: string) {
        this.name = name.trim()
    }

    changeDescription(description: string) {
        this.description = description.trim()
    }

    changeResponsibleEmail(responsibleEmail: string) {
        this.responsibleEmail = responsibleEmail.trim().toLowerCase()
    }

    changeCurrency(currency: currecyType) {
        this.currency = currency
        this.serviceSystems.forEach((serviceSystem) => {
            serviceSystem.changeCurrency(currency)
        })
    }

    changeAmount(amount: string) {
        this.amount = amount
        this.serviceSystems.forEach((serviceSystem) => {
            serviceSystem.changeAmount(amount)
        })
    }

    hasSystem(systemId: string) {
        return !!this.serviceSystems.find((item) => item.systemId === systemId)
    }

    addServiceSystem(systemId: string, allocation: string) {
        const serviceSystem = ServiceSystem.create({
            serviceId: this.serviceId,
            systemId,
            allocation,
            totalAmount: this.amount,
            currency: this.currency,
        })

        this.serviceSystems.push(serviceSystem)
    }

    changeServiceSystemAllocation(systemId: string, allocation: string) {
        const serviceSystem = this.serviceSystems.find(
            (item) => item.systemId === systemId,
        )

        if (!serviceSystem) {
            throw new Error(`systemId #${systemId} not found to be updated`)
        }

        serviceSystem.changeAllocation(this.amount, allocation)
        serviceSystem.changeAmount(this.amount)
    }

    removeServiceSystem(systemId: string) {
        this.serviceSystems = this.serviceSystems.filter(
            (item) => item.systemId !== systemId,
        )
    }

    changeActivationStatusBasedOnAllocation() {
        const allocation = this.serviceSystems.reduce(
            (acc, item) => new Decimal(acc).add(toDecimal(item.allocation)),
            new Decimal(0),
        )

        if (allocation.eq(100.0)) {
            this.isActive = true
            return
        }

        this.isActive = false
    }
}
