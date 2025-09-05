import { AgreementRepository } from "@/core/agreement/domain/agreement.repository"
import { UnitOfWork } from "@/core/shared/domain/repositories/unit-of-work"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { insertServiceSchemaType } from "@/zod-schemas/service"
import { ServiceRepository } from "../../domain/service.repository"

export class SaveServiceUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(input: SaveServiceInput): Promise<SaveServiceOutput> {
        return await this.uow.execute(async (uow) => {
            const serviceRepo = uow.getRepository<ServiceRepository>("service")
            const agreementRepo =
                uow.getRepository<AgreementRepository>("agreement")
            const entity = await serviceRepo.find(input.serviceId)

            const agreement = await agreementRepo.find(input.agreementId)

            if (!!agreement && agreement.isRevised) {
                throw new ValidationError(
                    `Agreement ID #${input.agreementId} is already revised`,
                )
            }

            if (!entity) {
                throw new ValidationError(
                    `Service ID #${input.serviceId} not found`,
                )
            }

            entity.changeName(input.name)
            entity.changeDescription(input.description)
            entity.changeResponsibleEmail(input.responsibleEmail)
            entity.changeAmount(input.runAmount, input.chgAmount)
            entity.changeCurrency(input.currency)
            entity.changeProviderAllocation(input.providerAllocation)
            entity.changeLocalAllocation(input.localAllocation)
            entity.changeStatus(input.status)
            entity.changeValidatorEmail(input.validatorEmail)
            entity.changeDocumentUrl(input.documentUrl)
            entity.changeActivationStatusBasedOnAllocation()

            entity.validate()

            await serviceRepo.update(entity)

            return {
                serviceId: entity.serviceId,
            }
        })
    }
}

export type SaveServiceInput = insertServiceSchemaType

export type SaveServiceOutput = {
    serviceId: string
}
