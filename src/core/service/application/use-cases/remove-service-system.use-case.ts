import { deleteServiceSystemSchemaType } from "@/actions/deleteServiceSystemAction"
import { UnitOfWork } from "@/core/shared/domain/repositories/unit-of-work"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { ServiceRepository } from "../../domain/service.repository"

export class RemoveServiceSystemUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(
        input: RemoveServiceSystemInput,
    ): Promise<RemoveServiceSystemOutput> {
        return await this.uow.execute(async (uow) => {
            const repo = uow.getRepository<ServiceRepository>("service")
            const entity = await repo.find(input.serviceId)

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
        })
    }
}

export type RemoveServiceSystemInput = deleteServiceSystemSchemaType

export type RemoveServiceSystemOutput = {
    serviceId: string
    systemId: string
}
