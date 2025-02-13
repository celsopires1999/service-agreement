import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { insertServiceSchemaType } from "@/zod-schemas/service"

export class SaveServiceUseCase {
    async execute(input: SaveServiceInput): Promise<SaveServiceOutput> {
        const serviceRepo = new ServiceDrizzleRepository()
        const agreementRepo = new AgreementDrizzleRepository()
        const entity = await serviceRepo.findById(input.serviceId)

        const agreement = await agreementRepo.findById(input.agreementId)

        if (!!agreement && agreement.isRevised) {
            throw new Error(
                `Agreement ID #${input.agreementId} is already revised`,
            )
        }

        if (!entity) {
            throw new Error(`Service ID #${input.serviceId} not found`)
        }

        entity.changeName(input.name)
        entity.changeDescription(input.description)
        entity.changeResponsibleEmail(input.responsibleEmail)
        entity.changeAmount(input.runAmount, input.chgAmount)
        entity.changeCurrency(input.currency)
        entity.changeProviderAllocation(input.providerAllocation)
        entity.changeLocalAllocation(input.localAllocation)
        entity.changeIsValidated(input.isValidated)
        entity.changeValidatorEmail(input.validatorEmail)
        entity.changeActivationStatusBasedOnAllocation()

        entity.validate()

        const serviceId = await serviceRepo.update(entity)

        return {
            serviceId,
        }
    }
}

export type SaveServiceInput = insertServiceSchemaType

export type SaveServiceOutput = {
    serviceId: string
}
