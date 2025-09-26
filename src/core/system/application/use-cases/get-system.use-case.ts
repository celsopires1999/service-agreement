import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { SystemRepository } from "../../domain/system.repository"

export class GetSystemUseCase {
    constructor(private readonly systemRepo: SystemRepository) {}

    async execute(input: GetSystemInput): Promise<GetSystemOutput> {
        const system = await this.systemRepo.find(input.systemId)
        if (!system) {
            throw new ValidationError(`System ID #${input.systemId} not found`)
        }
        return system.toJSON()
    }
}

export type GetSystemInput = {
    systemId: string
}

export type GetSystemOutput = {
    systemId: string
    name: string
    description: string
    applicationId: string
}
