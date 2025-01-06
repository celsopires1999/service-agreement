import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { insertServiceSystemsSchemaType } from "@/zod-schemas/service_systems"

export class SaveServiceSystemUseCase {
    async execute(
        input: SaveServiceSystemInput,
    ): Promise<SaveServiceSystemOutput> {
        const repo = new ServiceDrizzleRepository()
        const entity = await repo.findById(input.serviceId)

        if (!entity) {
            throw new Error(`Service ID #${input.serviceId} not found`)
        }

        if (entity.hasSystem(input.systemId)) {
            entity.changeServiceSystemAllocation(
                input.systemId,
                input.allocation,
            )
        } else {
            entity.addServiceSystem(input.systemId, input.allocation)
        }

        entity.changeActivationStatusBasedOnAllocation()

        await repo.update(entity)

        return {
            serviceId: input.serviceId,
            systemId: input.systemId,
        }
    }
}

export type SaveServiceSystemInput = insertServiceSystemsSchemaType

export type SaveServiceSystemOutput = {
    serviceId: string
    systemId: string
}
