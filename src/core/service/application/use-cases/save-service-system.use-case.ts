import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { saveServiceSystemsSchemaType } from "@/zod-schemas/service_systems"

export class SaveServiceSystemUseCase {
    async execute(
        input: SaveServiceSystemInput,
    ): Promise<SaveServiceSystemOutput> {
        const repo = new ServiceDrizzleRepository()
        const entity = await repo.findById(input.serviceId)

        if (!entity) {
            throw new ValidationError(
                `Service ID #${input.serviceId} not found`,
            )
        }

        if (entity.status === "approved") {
            throw new ValidationError(
                `Service ID #${input.serviceId} is already approved`,
            )
        }

        if (entity.status === "rejected") {
            throw new ValidationError(
                `Service ID #${input.serviceId} is already rejected`,
            )
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

export type SaveServiceSystemInput = saveServiceSystemsSchemaType

export type SaveServiceSystemOutput = {
    serviceId: string
    systemId: string
}
