import { Service } from "@/core/service/domain/service"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { insertServiceSchemaType } from "@/zod-schemas/service"

export class CreateServiceUseCase {
    async execute(input: CreateServiceInput): Promise<CreateServiceOutput> {
        const repo = new ServiceDrizzleRepository()

        const entity = Service.create({
            ...input,
        })

        entity.validate()

        const serviceId = await repo.insert(entity)

        return {
            serviceId,
        }
    }
}

export type CreateServiceInput = Omit<
    insertServiceSchemaType,
    "serviceId" | "amount" | "isActive" | "isValidated"
>

export type CreateServiceOutput = {
    serviceId: string
}
