import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { AgreementValidator } from "./agreement.validator"

export type AgreementConstructorProps = {
    agreementId: string
    year: number
    code: string
    revision: number
    isRevised: boolean
    revisionDate: string
    providerPlanId: string
    localPlanId: string
    name: string
    description: string
    contactEmail: string
    comment: string | null
    documentUrl: string | null
}

export type AgreementCreateCommand = Omit<
    AgreementConstructorProps,
    "agreementId"
>

export class Agreement {
    agreementId: string
    year: number
    code: string
    revision: number
    isRevised: boolean
    revisionDate: string
    providerPlanId: string
    localPlanId: string
    name: string
    description: string
    contactEmail: string
    comment: string | null
    documentUrl: string | null

    constructor(props: AgreementConstructorProps) {
        this.agreementId = props.agreementId
        this.year = props.year
        this.code = props.code
        this.revision = props.revision
        this.isRevised = props.isRevised
        this.revisionDate = props.revisionDate
        this.providerPlanId = props.providerPlanId
        this.localPlanId = props.localPlanId
        this.name = props.name
        this.description = props.description
        this.contactEmail = props.contactEmail
        this.comment = props.comment
        this.documentUrl = props.documentUrl
    }

    static create(props: AgreementCreateCommand) {
        return new Agreement({
            ...props,
            agreementId: new Uuid().toString(),
        })
    }

    validate() {
        const validator = new AgreementValidator()
        validator.validate(this)
    }

    changeYear(year: number) {
        this.year = year
    }

    changeCode(code: string) {
        this.code = code
    }

    changeRevision(revision: number) {
        this.revision = revision
    }

    changeIsRevised(isRevised: boolean) {
        this.isRevised = isRevised
    }

    changeRevisionDate(revisionDate: string) {
        this.revisionDate = revisionDate
    }

    changeProviderPlanId(providerPlanId: string) {
        this.providerPlanId = providerPlanId
    }

    changeLocalPlanId(localPlanId: string) {
        this.localPlanId = localPlanId
    }

    changeName(name: string) {
        this.name = name
    }

    changeDescription(description: string) {
        this.description = description
    }

    changeContactEmail(contactEmail: string) {
        this.contactEmail = contactEmail
    }

    changeComment(comment: string | null) {
        this.comment = comment
    }

    changeDocumentUrl(documentUrl: string | null) {
        this.documentUrl = documentUrl
    }

    newRevision(
        revisionDate: string,
        providerPlanId: string,
        localPlanId: string,
    ) {
        return new Agreement({
            agreementId: new Uuid().toString(),
            year: this.year,
            code: this.code,
            revision: this.revision + 1,
            isRevised: false,
            revisionDate: revisionDate,
            providerPlanId: providerPlanId,
            localPlanId: localPlanId,
            name: this.name,
            description: this.description,
            contactEmail: this.contactEmail,
            comment: this.comment,
            documentUrl: this.documentUrl,
        })
    }
}
