import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { Chance } from "chance"
import { Agreement } from "./agreement"

type PropOrFactory<T> = T | ((index: number) => T)

export class AgreementDataBuilder<TBuild = unknown> {
    // auto generated in entity
    private _agreementId: PropOrFactory<string> | undefined = undefined
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _year: PropOrFactory<number> = (_index) =>
        +this.chance.year({
            min: 2024,
            max: 2050,
        })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _code: PropOrFactory<string> = (_index) =>
        this.chance.string({
            length: 20,
            pool: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _revision: PropOrFactory<number> = (_index) => 1
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _isRevised: PropOrFactory<boolean> = (_index) => false
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _revisionDate: PropOrFactory<string> = (_index) =>
        new Date(this.chance.date({ year: 2024 })).toISOString().split("T")[0]
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _providerPlanId: PropOrFactory<string> = (_index) =>
        new Uuid().toString()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _localPlanId: PropOrFactory<string> = (_index) =>
        new Uuid().toString()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _name: PropOrFactory<string> = (_index) => this.chance.word()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _description: PropOrFactory<string> = (_index) =>
        this.chance.sentence({ words: 10 })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _contactEmail: PropOrFactory<string> = (_index) =>
        this.chance.email()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _comment: PropOrFactory<string | null> = (_index) => null
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _documentUrl: PropOrFactory<string | null> = (_index) => null

    private readonly countObjs: number

    static anAgreement() {
        return new AgreementDataBuilder<Agreement>()
    }

    static theAgreements(countObjs: number) {
        return new AgreementDataBuilder<Agreement[]>(countObjs)
    }

    private readonly chance: Chance.Chance

    private constructor(countObjs: number = 1) {
        this.countObjs = countObjs
        this.chance = Chance()
    }

    withAgreementId(valueOrFactory: PropOrFactory<string>) {
        this._agreementId = valueOrFactory
        return this
    }
    withYear(valueOrFactory: PropOrFactory<number>) {
        this._year = valueOrFactory
        return this
    }
    withCode(valueOrFactory: PropOrFactory<string>) {
        this._code = valueOrFactory
        return this
    }
    withRevision(valueOrFactory: PropOrFactory<number>) {
        this._revision = valueOrFactory
        return this
    }
    withIsRevised(valueOrFactory: PropOrFactory<boolean>) {
        this._isRevised = valueOrFactory
        return this
    }
    withRevisionDate(valueOrFactory: PropOrFactory<string>) {
        this._revisionDate = valueOrFactory
        return this
    }
    withProviderPlanId(valueOrFactory: PropOrFactory<string>) {
        this._providerPlanId = valueOrFactory
        return this
    }
    withLocalPlanId(valueOrFactory: PropOrFactory<string>) {
        this._localPlanId = valueOrFactory
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
    withContactEmail(valueOrFactory: PropOrFactory<string>) {
        this._contactEmail = valueOrFactory
        return this
    }
    withComment(valueOrFactory: PropOrFactory<string | null>) {
        this._comment = valueOrFactory
        return this
    }
    withDocumentUrl(valueOrFactory: PropOrFactory<string | null>) {
        this._documentUrl = valueOrFactory
        return this
    }

    withInvalidLowerYear() {
        this._year = 2023
        return this
    }

    withInvalidUpperYear() {
        this._year = 2126
        return this
    }

    withInvalidCodeTooShort() {
        this._code = ""
        return this
    }

    withInvalidCodeTooLong(value?: string) {
        this._code =
            value ??
            this.chance.string({
                length: 21,
                pool: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            })
        return this
    }

    withInvalidLowerRevision() {
        this._revision = -1
        return this
    }

    withInvalidUpperRevision() {
        this._revision = 101
        return this
    }

    withInvalidRevisionDate() {
        this._revisionDate = "invalid date"
        return this
    }

    withInvalidProviderPlanIdNotAUuid() {
        this._providerPlanId = "not a uuid"
        return this
    }

    withInvalidLocalPlanIdNotAUuid() {
        this._localPlanId = "not a uuid"
        return this
    }

    withInvalidNameTooShort() {
        this._name = ""
        return this
    }

    withInvalidNameTooLong(value?: string) {
        this._name = value ?? this.chance.string({ length: 101 })
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

    withInvalidContactEmail() {
        this._contactEmail = "not-an-email"
        return this
    }

    withInvalidCommentTooLong(value?: string) {
        this._comment = value ?? this.chance.string({ length: 501 })
        return this
    }

    withInvalidDocumentUrl() {
        this._documentUrl = "not-a-url"
        return this
    }

    withInvalidDocumentUrlTooLong(value?: string) {
        this._documentUrl =
            value ?? `http://${this.chance.string({ length: 293 })}.com`
        return this
    }

    build(): TBuild {
        const agreements = new Array(this.countObjs)
            .fill(undefined)
            .map((_, index) => {
                const agreement = new Agreement({
                    agreementId: this._agreementId
                        ? this.callFactory(this._agreementId, index)
                        : new Uuid().toString(),
                    year: Number.parseInt(this.callFactory(this._year, index)),
                    code: this.callFactory(this._code, index),
                    revision: this.callFactory(this._revision, index),
                    isRevised: this.callFactory(this._isRevised, index),
                    revisionDate: this.callFactory(this._revisionDate, index),
                    providerPlanId: this.callFactory(
                        this._providerPlanId,
                        index,
                    ),
                    localPlanId: this.callFactory(this._localPlanId, index),
                    name: this.callFactory(this._name, index),
                    description: this.callFactory(this._description, index),
                    contactEmail: this.callFactory(this._contactEmail, index),
                    comment: this.callFactory(this._comment, index),
                    documentUrl: this.callFactory(this._documentUrl, index),
                })
                agreement.validate()
                return agreement
            })
        return this.countObjs === 1
            ? (agreements[0] as unknown as TBuild)
            : (agreements as unknown as TBuild)
    }

    get agreementId(): string {
        return this.getValue("agreementId")
    }
    get year(): number {
        return this.getValue("year")
    }
    get code(): string {
        return this.getValue("code")
    }
    get revision(): number {
        return this.getValue("revision")
    }
    get isRevised(): boolean {
        return this.getValue("isRevised")
    }
    get revisionDate(): string {
        return this.getValue("revisionDate")
    }
    get providerPlanId(): string {
        return this.getValue("providerPlanId")
    }
    get localPlanId(): string {
        return this.getValue("localPlanId")
    }
    get name(): string {
        return this.getValue("name")
    }
    get description(): string {
        return this.getValue("description")
    }
    get contactEmail(): string {
        return this.getValue("contactEmail")
    }
    get comment(): string | null {
        return this.getValue("comment")
    }
    get documentUrl(): string | null {
        return this.getValue("documentUrl")
    }

    private getValue(prop: keyof Agreement) {
        const optional = ["agreementId"]
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
