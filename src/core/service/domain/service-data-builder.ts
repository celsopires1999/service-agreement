import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { toDecimal } from "@/lib/utils"
import { Chance } from "chance"
import { Service } from "./service"
import { ServiceStatusType, currecyType } from "./service.types"
import { ServiceSystem } from "./serviceSystems"

type PropOrFactory<T> = T | ((index: number) => T)

type ServiceSystemProps = {
    systemId?: string
    allocation?: string
}

export class ServiceDataBuilder<TBuild = unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _serviceId: PropOrFactory<string> | undefined = (_index) =>
        new Uuid().toString()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _agreementId: PropOrFactory<string> = (_index) =>
        new Uuid().toString()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _name: PropOrFactory<string> = (_index) =>
        this.chance.sentence({ words: 2 })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _description: PropOrFactory<string> = (_index) =>
        this.chance.sentence({ words: 5 })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _runAmount: PropOrFactory<string> = (_index) =>
        this.chance.floating({ min: 0, max: 10000, fixed: 2 }).toString()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _chgAmount: PropOrFactory<string> = (_index) =>
        this.chance.floating({ min: 0, max: 1000, fixed: 2 }).toString()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _currency: PropOrFactory<currecyType> = (_index) => "EUR"
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _responsibleEmail: PropOrFactory<string> = (_index) =>
        this.chance.email()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _providerAllocation: PropOrFactory<string> = (_index) =>
        this.chance.paragraph({ sentences: 1 }).slice(0, 500)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _localAllocation: PropOrFactory<string> = (_index) =>
        this.chance.paragraph({ sentences: 1 }).slice(0, 500)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _status: PropOrFactory<ServiceStatusType> = (_index) => "created"
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _validatorEmail: PropOrFactory<string> = (_index) =>
        this.chance.email()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _documentUrl: PropOrFactory<string | null> = (_index) =>
        this.chance.url()
    private _serviceSystems: PropOrFactory<ServiceSystemProps[]> = (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _index,
    ) => []

    private readonly countObjs: number

    static aService() {
        return new ServiceDataBuilder<Service>()
    }

    static theServices(countObjs: number) {
        return new ServiceDataBuilder<Service[]>(countObjs)
    }

    private readonly chance: Chance.Chance

    private constructor(countObjs: number = 1) {
        this.countObjs = countObjs
        this.chance = Chance()
    }

    withServiceId(valueOrFactory: PropOrFactory<string>) {
        this._serviceId = valueOrFactory
        return this
    }

    withAgreementId(valueOrFactory: PropOrFactory<string>) {
        this._agreementId = valueOrFactory
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

    withRunAmount(valueOrFactory: PropOrFactory<string>) {
        this._runAmount = valueOrFactory
        return this
    }

    withChgAmount(valueOrFactory: PropOrFactory<string>) {
        this._chgAmount = valueOrFactory
        return this
    }

    withCurrency(valueOrFactory: PropOrFactory<currecyType>) {
        this._currency = valueOrFactory
        return this
    }

    withResponsibleEmail(valueOrFactory: PropOrFactory<string>) {
        this._responsibleEmail = valueOrFactory
        return this
    }

    withProviderAllocation(valueOrFactory: PropOrFactory<string>) {
        this._providerAllocation = valueOrFactory
        return this
    }

    withLocalAllocation(valueOrFactory: PropOrFactory<string>) {
        this._localAllocation = valueOrFactory
        return this
    }

    withStatus(valueOrFactory: PropOrFactory<ServiceStatusType>) {
        this._status = valueOrFactory
        return this
    }

    withValidatorEmail(valueOrFactory: PropOrFactory<string>) {
        this._validatorEmail = valueOrFactory
        return this
    }

    withDocumentUrl(valueOrFactory: PropOrFactory<string | null>) {
        this._documentUrl = valueOrFactory
        return this
    }

    withServiceSystems(valueOrFactory: PropOrFactory<ServiceSystemProps[]>) {
        this._serviceSystems = valueOrFactory
        return this
    }

    withInvalidServiceId() {
        this._serviceId = "invalid-uuid"
        return this
    }

    withInvalidAgreementId() {
        this._agreementId = "invalid-uuid"
        return this
    }

    withInvalidNameTooShort() {
        this._name = "a"
        return this
    }

    withInvalidNameTooLong() {
        this._name = this.chance.string({ length: 256 })
        return this
    }

    withInvalidDescriptionTooLong() {
        this._description = this.chance.string({ length: 501 })
        return this
    }

    withInvalidRunAmount() {
        this._runAmount = this.chance.string()
        return this
    }

    withInvalidChgAmount() {
        this._chgAmount = this.chance.string()
        return this
    }

    withInvalidCurrency() {
        this._currency = "invalid-currency" as currecyType
        return this
    }

    withInvalidResponsibleEmail() {
        this._responsibleEmail = "invalid-email"
        return this
    }

    withInvalidProviderAllocation() {
        this._providerAllocation = this.chance.string({ length: 501 })
        return this
    }

    withInvalidLocalAllocation() {
        this._localAllocation = this.chance.string({ length: 501 })
        return this
    }

    withInvalidStatus() {
        this._status = "invalid-status" as ServiceStatusType
        return this
    }

    withInvalidValidatorEmail() {
        this._validatorEmail = "invalid-email"
        return this
    }

    withInvalidDocumentUrl() {
        this._documentUrl = "invalid-url"
        return this
    }

    withInvalidServiceSystems() {
        this._serviceSystems = () => [
            {
                systemId: "invalid-uuid",
                allocation: "invalid-allocation",
            },
        ]
        return this
    }

    build(): TBuild {
        const services = new Array(this.countObjs)
            .fill(undefined)
            .map((_, index) => {
                const serviceId = this.callFactory(this._serviceId, index)
                const runAmount = this.callFactory(this._runAmount, index)
                const chgAmount = this.callFactory(this._chgAmount, index)
                const amount = toDecimal(runAmount)
                    .add(toDecimal(chgAmount))
                    .toFixed(2)
                const currency = this.callFactory(this._currency, index)

                const serviceSystemsProps = this.callFactory(
                    this._serviceSystems,
                    index,
                )
                const serviceSystems = serviceSystemsProps.map(
                    (props: ServiceSystemProps) => {
                        return ServiceSystem.create({
                            serviceId,
                            systemId: props.systemId ?? new Uuid().toString(),
                            allocation: props.allocation ?? "100",
                            totalRunAmount: runAmount,
                            totalChgAmount: chgAmount,
                            currency: currency,
                        })
                    },
                )

                const service = new Service({
                    serviceId,
                    agreementId: this.callFactory(this._agreementId, index),
                    name: this.callFactory(this._name, index),
                    description: this.callFactory(this._description, index),
                    runAmount,
                    chgAmount,
                    amount,
                    currency,
                    responsibleEmail: this.callFactory(
                        this._responsibleEmail,
                        index,
                    ),
                    isActive: false,
                    providerAllocation: this.callFactory(
                        this._providerAllocation,
                        index,
                    ),
                    localAllocation: this.callFactory(
                        this._localAllocation,
                        index,
                    ),
                    status: this.callFactory(this._status, index),
                    validatorEmail: this.callFactory(
                        this._validatorEmail,
                        index,
                    ),
                    documentUrl: this.callFactory(this._documentUrl, index),
                    serviceSystems,
                })
                service.changeActivationStatusBasedOnAllocation()
                service.validate()
                return service
            })

        return this.countObjs === 1
            ? (services[0] as unknown as TBuild)
            : (services as unknown as TBuild)
    }

    private callFactory(factoryOrValue: PropOrFactory<unknown>, index: number) {
        return typeof factoryOrValue === "function"
            ? factoryOrValue(index)
            : factoryOrValue
    }

    get serviceId(): string {
        return this.getValue("serviceId")
    }
    get agreementId(): string {
        return this.getValue("agreementId")
    }
    get name(): string {
        return this.getValue("name")
    }
    get description(): string {
        return this.getValue("description")
    }
    get runAmount(): string {
        return this.getValue("runAmount")
    }
    get chgAmount(): string {
        return this.getValue("chgAmount")
    }
    get currency(): currecyType {
        return this.getValue("currency")
    }
    get responsibleEmail(): string {
        return this.getValue("responsibleEmail")
    }
    get providerAllocation(): string {
        return this.getValue("providerAllocation")
    }
    get localAllocation(): string {
        return this.getValue("localAllocation")
    }
    get status(): ServiceStatusType {
        return this.getValue("status")
    }
    get validatorEmail(): string {
        return this.getValue("validatorEmail")
    }
    get documentUrl(): string | null {
        return this.getValue("documentUrl")
    }
    get serviceSystems(): ServiceSystemProps[] {
        return this.getValue("serviceSystems")
    }

    private getValue<T>(prop: keyof Service): T {
        const optional = ["NOTHING"]
        const privateProp = `_${prop}` as keyof this
        if (!this[privateProp] && !optional.includes(prop)) {
            throw new Error(
                `Property ${prop} does not have a factory, use "with" method instead`,
            )
        }
        return this.callFactory(this[privateProp], 0) as T
    }
}
