import { v4 as uuidv4 } from "uuid"
import { ServiceSystem } from "./serviceSystems"

export type currecyType = "EUR" | "USD"

export type ServiceConstructorProps = {
    serviceId: string
    agreementId: string
    name: string
    description: string
    amount: string
    currency: currecyType
    responsibleEmail: string
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
    serviceSystems: ServiceSystem[]

    constructor(props: ServiceConstructorProps) {
        this.serviceId = props.serviceId
        this.agreementId = props.agreementId.trim()
        this.name = props.name.trim()
        this.description = props.description.trim()
        this.amount = props.amount
        this.currency = props.currency
        this.responsibleEmail = props.responsibleEmail.trim().toLowerCase()
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
}
