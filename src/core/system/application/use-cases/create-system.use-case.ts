import { System } from "@/core/system/domain/system"
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"

export class CreateSystemUseCase {
    constructor(private readonly systemRepo: SystemDrizzleRepository) {}

    async execute(input: CreateSystemInput): Promise<CreateSystemOutput> {
        const system = System.create(input)
        system.validate()
        await this.systemRepo.insert(system)
        return { systemId: system.systemId }
    }
}

export type CreateSystemInput = {
    name: string
    description: string
    applicationId: string
}

export type CreateSystemOutput = {
    systemId: string
}
