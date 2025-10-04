import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { SystemRepository } from "../../domain/system.repository"

export class DeleteSystemUseCase {
    constructor(private readonly systemRepo: SystemRepository) {}

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
