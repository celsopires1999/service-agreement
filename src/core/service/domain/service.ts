import { toDecimal } from "@/lib/utils"
import Decimal from "decimal.js"
import { v4 as uuidv4 } from "uuid"
import { ServiceSystem } from "./serviceSystems"

export type currecyType = "EUR" | "USD"

export type ServiceConstructorProps = {
    serviceId: string
    agreementId: string
    name: string
    description: string
    runAmount: string
    chgAmount: string
    amount: string
    currency: currecyType
    responsibleEmail: string
    isActive: boolean
    providerAllocation: string
    localAllocation: string
    serviceSystems?: ServiceSystem[]
}

export type ServiceCreateCommand = Omit<
    ServiceConstructorProps,
    "serviceId" | "amount" | "isActive"
>

export class Service {
    serviceId: string
    agreementId: string
    name: string
    description: string
    runAmount: string
    chgAmount: string
    amount: string
    currency: currecyType
    responsibleEmail: string
    isActive: boolean
    providerAllocation: string
    localAllocation: string
    serviceSystems: ServiceSystem[]

    constructor(props: ServiceConstructorProps) {
        this.serviceId = props.serviceId
        this.agreementId = props.agreementId.trim()
        this.name = props.name.trim()
        this.description = props.description.trim()
        this.runAmount = props.runAmount
        this.chgAmount = props.chgAmount
        this.amount = props.amount
        this.currency = props.currency
        this.responsibleEmail = props.responsibleEmail.trim().toLowerCase()
        this.isActive = props.isActive
        this.providerAllocation = props.providerAllocation.trim()
        this.localAllocation = props.localAllocation.trim()
        this.serviceSystems = props.serviceSystems ?? []
    }

    static create(props: ServiceCreateCommand) {
        return new Service({
            ...props,
            serviceId: uuidv4(),
            amount: toDecimal(props.runAmount)
                .add(toDecimal(props.chgAmount))
                .toFixed(2),
            isActive: false,
        })
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

    changeAmount(runAmount: string, chgAmount: string) {
        const amount = toDecimal(runAmount).add(toDecimal(chgAmount)).toFixed(2)
        this.runAmount = runAmount
        this.chgAmount = chgAmount
        this.amount = amount
        this.serviceSystems.forEach((serviceSystem) => {
            serviceSystem.changeAmount(runAmount, chgAmount)
        })
    }

    changeProviderAllocation(allocation: string) {
        this.providerAllocation = allocation
    }

    changeLocalAllocation(allocation: string) {
        this.localAllocation = allocation
    }

    hasSystem(systemId: string) {
        return !!this.serviceSystems.find((item) => item.systemId === systemId)
    }

    addServiceSystem(systemId: string, allocation: string) {
        const serviceSystem = ServiceSystem.create({
            serviceId: this.serviceId,
            systemId,
            allocation,
            totalRunAmount: this.runAmount,
            totalChgAmount: this.chgAmount,
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

        serviceSystem.changeAllocation(
            this.runAmount,
            this.chgAmount,
            allocation,
        )
        // serviceSystem.changeAmount(this.amount)
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
