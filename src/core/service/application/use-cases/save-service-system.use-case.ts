import { UnitOfWork } from "@/core/shared/domain/repositories/unit-of-work"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { saveServiceSystemsSchemaType } from "@/zod-schemas/service_systems"
import { ServiceRepository } from "../../domain/service.repository"

export class SaveServiceSystemUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(
        input: SaveServiceSystemInput,
    ): Promise<SaveServiceSystemOutput> {
        return await this.uow.execute(async (uow) => {
            const repo = uow.getRepository<ServiceRepository>("service")
            const entity = await repo.find(input.serviceId)

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
        })
    }
}

export type SaveServiceSystemInput = saveServiceSystemsSchemaType

export type SaveServiceSystemOutput = {
    serviceId: string
    systemId: string
}
