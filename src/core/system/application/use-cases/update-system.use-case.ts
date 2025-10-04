import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { SystemRepository } from "../../domain/system.repository"

export class UpdateSystemUseCase {
    constructor(private readonly systemRepo: SystemRepository) {}

    async execute(input: UpdateSystemInput): Promise<void> {
        const system = await this.systemRepo.find(input.systemId)
        if (!system) {
            throw new ValidationError(`System ID #${input.systemId} not found`)
        }

        input.name && system.changeName(input.name)
        input.description && system.changeDescription(input.description)
        input.applicationId && system.changeApplicationId(input.applicationId)

        system.validate()

        await this.systemRepo.update(system)
    }
}

export type UpdateSystemInput = {
    systemId: string
    name?: string
    description?: string
    applicationId?: string
}
