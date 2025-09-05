import { Service } from "@/core/service/domain/service"
import { UnitOfWork } from "@/core/shared/domain/repositories/unit-of-work"
import { insertServiceSchemaType } from "@/zod-schemas/service"
import { ServiceRepository } from "../../domain/service.repository"

export class CreateServiceUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(input: CreateServiceInput): Promise<CreateServiceOutput> {
        return await this.uow.execute(async (uow) => {
            const entity = Service.create({
                ...input,
            })

            entity.validate()
            const repo = uow.getRepository<ServiceRepository>("service")
            await repo.insert(entity)

            return {
                serviceId: entity.serviceId,
            }
        })
    }
}

export type CreateServiceInput = Omit<
    insertServiceSchemaType,
    "serviceId" | "amount" | "isActive" | "status"
>

export type CreateServiceOutput = {
    serviceId: string
}
