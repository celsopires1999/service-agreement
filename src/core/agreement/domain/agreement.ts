import { v4 as uuidv4 } from "uuid"

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
    }

    static create(props: AgreementCreateCommand) {
        return new Agreement({
            agreementId: uuidv4(),
            ...props,
        })
    }

    newRevision(
        revisionDate: string,
        providerPlanId: string,
        localPlanId: string,
    ) {
        return new Agreement({
            agreementId: uuidv4(),
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
        })
    }
}
