import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { db } from "@/db"
import { insertServiceSchemaType } from "@/zod-schemas/service"

export class SaveServiceUseCase {
    async execute(input: SaveServiceInput): Promise<SaveServiceOutput> {
        const serviceRepo = new ServiceDrizzleRepository(db)
        const agreementRepo = new AgreementDrizzleRepository(db)
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

        const serviceId = await serviceRepo.update(entity)

        return {
            serviceId: entity.serviceId,
        }
    }
}

export type SaveServiceInput = insertServiceSchemaType

export type SaveServiceOutput = {
    serviceId: string
}
