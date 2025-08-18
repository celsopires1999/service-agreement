import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { toDecimal } from "@/lib/utils"
import Decimal from "decimal.js"
import { v4 as uuidv4 } from "uuid"
import { ServiceSystem } from "./serviceSystems"

export type currecyType = "EUR" | "USD"

export const ServiceStatus = {
    CREATED: "created",
    ASSIGNED: "assigned",
    REJECTED: "rejected",
    APPROVED: "approved",
} as const

export type ServiceStatusType =
    (typeof ServiceStatus)[keyof typeof ServiceStatus]

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
    status: ServiceStatusType
    validatorEmail: string
    documentUrl: string | null
    serviceSystems?: ServiceSystem[]
}

export type ServiceCreateCommand = Omit<
    ServiceConstructorProps,
    "serviceId" | "amount" | "isActive" | "status"
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
    status: ServiceStatusType
    validatorEmail: string
    documentUrl: string | null
    serviceSystems: ServiceSystem[]
    private prevStatus: ServiceStatusType
    private isChanged = false

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
        this.status = props.status
        this.validatorEmail = props.validatorEmail.trim().toLowerCase()
        this.documentUrl = props.documentUrl ?? null
        this.serviceSystems = props.serviceSystems ?? []
        this.prevStatus = props.status
    }

    static create(props: ServiceCreateCommand) {
        return new Service({
            ...props,
            serviceId: uuidv4(),
            amount: toDecimal(props.runAmount)
                .add(toDecimal(props.chgAmount))
                .toFixed(2),
            isActive: false,
            status: "created",
        })
    }

    changeName(name: string) {
        if (this.name === name) {
            return
        }
        this.isChanged = true
        this.name = name.trim()
    }

    changeDescription(description: string) {
        if (this.description === description) {
            return
        }
        this.isChanged = true
        this.description = description.trim()
    }

    changeResponsibleEmail(responsibleEmail: string) {
        if (this.responsibleEmail === responsibleEmail) {
            return
        }
        this.isChanged = true
        this.responsibleEmail = responsibleEmail.trim().toLowerCase()
    }

    changeCurrency(currency: currecyType) {
        if (this.currency === currency) {
            return
        }
        this.isChanged = true
        this.currency = currency
        this.serviceSystems.forEach((serviceSystem) => {
            serviceSystem.changeCurrency(currency)
        })
    }

    changeAmount(runAmount: string, chgAmount: string) {
        if (this.runAmount === runAmount && this.chgAmount === chgAmount) {
            return
        }
        this.isChanged = true
        const amount = toDecimal(runAmount).add(toDecimal(chgAmount)).toFixed(2)
        this.runAmount = runAmount
        this.chgAmount = chgAmount
        this.amount = amount
        this.serviceSystems.forEach((serviceSystem) => {
            serviceSystem.changeAmount(runAmount, chgAmount)
        })
    }

    changeProviderAllocation(allocation: string) {
        if (this.providerAllocation === allocation) {
            return
        }
        this.isChanged = true
        this.providerAllocation = allocation
    }

    changeLocalAllocation(allocation: string) {
        if (this.localAllocation === allocation) {
            return
        }
        this.isChanged = true
        this.localAllocation = allocation
    }

    changeStatus(status: ServiceStatusType) {
        this.status = status
    }

    changeValidatorEmail(validatorEmail: string) {
        if (this.validatorEmail === validatorEmail) {
            return
        }
        this.isChanged = true
        this.validatorEmail = validatorEmail.trim().toLowerCase()
    }

    changeDocumentUrl(documentUrl: string | null) {
        if (this.documentUrl === documentUrl) {
            return
        }
        this.isChanged = true
        this.documentUrl = documentUrl ? documentUrl.trim() : null
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
            throw new ValidationError(
                `systemId #${systemId} not found to be updated`,
            )
        }

        serviceSystem.changeAllocation(
            this.runAmount,
            this.chgAmount,
            allocation,
        )
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

    validate() {
        if (
            this.isChanged &&
            (this.prevStatus === "approved" || this.prevStatus === "rejected")
        ) {
            throw new ValidationError(
                "Service cannot be changed after it has been approved or rejected",
            )
        }

        if (!Object.values(ServiceStatus).includes(this.status)) {
            throw new ValidationError("Invalid status: " + this.status)
        }

        if (this.status !== "approved" && this.status !== "rejected") {
            return
        }

        if (this.isActive === true) {
            return
        }

        throw new ValidationError(
            "Service cannot be neither approved nor rejected when cost allocation to systems is not 100%",
        )
    }
}
