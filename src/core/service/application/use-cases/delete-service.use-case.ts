import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { db } from "@/db"
import { services, serviceSystems } from "@/db/schema"
import { eq } from "drizzle-orm"

export class DeleteServiceUseCase {
    async execute(input: DeleteServiceInput): Promise<DeleteServiceOutput> {
        const serviceRepo = new ServiceDrizzleRepository()

        const foundService = await serviceRepo.findById(input.serviceId)

        if (!foundService) {
            throw new Error(`Service ID #${input.serviceId} not found`)
        }

        await db.transaction(async (tx) => {
            await tx
                .delete(serviceSystems)
                .where(eq(serviceSystems.serviceId, foundService.serviceId))

            await tx
                .delete(services)
                .where(eq(services.serviceId, input.serviceId))
        })

        return {
            serviceId: input.serviceId,
        }
    }
}

export type DeleteServiceInput = {
    serviceId: string
}

export type DeleteServiceOutput = {
    serviceId: string
}
