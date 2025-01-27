import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { insertServiceSchemaType } from "@/zod-schemas/service"

export class SaveServiceUseCase {
    async execute(input: SaveServiceInput): Promise<SaveServiceOutput> {
        const repo = new ServiceDrizzleRepository()
        const entity = await repo.findById(input.serviceId)

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
        entity.changeActivationStatusBasedOnAllocation()

        const serviceId = await repo.update(entity)

        return {
            serviceId,
        }
    }
}

export type SaveServiceInput = insertServiceSchemaType

export type SaveServiceOutput = {
    serviceId: string
}
