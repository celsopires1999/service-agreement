import { deleteServiceSystemSchemaType } from "@/actions/deleteServiceSystemAction"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"

export class RemoveServiceSystemUseCase {
    async execute(
        input: RemoveServiceSystemInput,
    ): Promise<RemoveServiceSystemOutput> {
        const repo = new ServiceDrizzleRepository()
        const entity = await repo.findById(input.serviceId)

        if (!entity) {
            throw new ValidationError(
                `Service ID #${input.serviceId} not found`,
            )
        }

        if (!entity.hasSystem(input.systemId)) {
            throw new ValidationError(
                `System ID #${input.systemId} for Service ID #${input.serviceId} not found`,
            )
        }

        entity.removeServiceSystem(input.systemId)
        entity.changeActivationStatusBasedOnAllocation()

        await repo.update(entity)

        return {
            serviceId: input.serviceId,
            systemId: input.systemId,
        }
    }
}

export type RemoveServiceSystemInput = deleteServiceSystemSchemaType

export type RemoveServiceSystemOutput = {
    serviceId: string
    systemId: string
}
