import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"

export class DeleteSystemUseCase {
    constructor(private readonly systemRepo: SystemDrizzleRepository) {}

    async execute(input: DeleteSystemInput): Promise<void> {
        const system = await this.systemRepo.find(input.systemId)
        if (!system) {
            throw new ValidationError(`System ID #${input.systemId} not found`)
        }

        await this.systemRepo.delete(input.systemId)
    }
}

export type DeleteSystemInput = {
    systemId: string
}
