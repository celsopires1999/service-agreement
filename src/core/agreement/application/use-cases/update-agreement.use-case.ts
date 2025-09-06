import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { UnitOfWork } from "@/core/shared/domain/repositories/unit-of-work"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { insertAgreementSchemaType } from "@/zod-schemas/agreement"
import { Agreement } from "../../domain/agreement"

export class UpdateAgreementUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(input: UpdateAgreementInput): Promise<UpdateAgreementOutput> {
        return await this.uow.execute(async (uow) => {
            const agreementRepo =
                uow.getRepository<AgreementDrizzleRepository>("agreement")
            const serviceRepo =
                uow.getRepository<ServiceDrizzleRepository>("service")

            const agreement = await agreementRepo.find(
                input.agreement.agreementId,
            )

            if (!agreement) {
                throw new ValidationError(
                    `Agreement ID #${input.agreement.agreementId} not found`,
                )
            }

            const revisions = await agreementRepo.countRevisions(
                agreement.year,
                agreement.code,
            )

            if (revisions > 1 && agreement.code !== input.agreement.code) {
                throw new ValidationError(
                    `Agreement with year ${agreement.year} and code ${agreement.code} cannot be changed (${revisions} revisions found)`,
                )
            }

            // Agreement can only be set to revised if all services are validated.
            if (agreement.isRevised !== input.agreement.isRevised) {
                const totalNotValidatedServices =
                    await serviceRepo.countNotValidatedServicesByAgreementId(
                        input.agreement.agreementId,
                    )

                if (totalNotValidatedServices > 0) {
                    throw new ValidationError(
                        `Agreement cannot be set to revised because ${totalNotValidatedServices} services are not validated`,
                    )
                }
            }

            agreement.changeYear(input.agreement.year)
            agreement.changeCode(input.agreement.code.trim())
            agreement.changeRevision(input.agreement.revision)
            agreement.changeIsRevised(input.agreement.isRevised ?? false)
            agreement.changeRevisionDate(input.agreement.revisionDate)
            agreement.changeProviderPlanId(input.agreement.providerPlanId)
            agreement.changeLocalPlanId(input.agreement.localPlanId)
            agreement.changeName(input.agreement.name.trim())
            agreement.changeDescription(input.agreement.description.trim())
            agreement.changeContactEmail(
                input.agreement.contactEmail.trim().toLocaleLowerCase(),
            )
            agreement.changeComment(input.agreement.comment?.trim() ?? null)
            agreement.changeDocumentUrl(
                input.agreement.documentUrl?.trim() ?? null,
            )

            agreement.validate()
            await agreementRepo.update(agreement)

            return {
                agreementId: agreement.agreementId,
            }
        })
    }
}

export type UpdateAgreementInput = {
    agreement: insertAgreementSchemaType
}

export type UpdateAgreementOutput = {
    agreementId: string
}
