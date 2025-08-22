import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"

export class DeletePlanUseCase {
    constructor(private readonly planRepo: PlanDrizzleRepository) {}

    async execute(input: DeletePlanInput): Promise<void> {
        const plan = await this.planRepo.find(input.planId)
        if (!plan) {
            throw new ValidationError(`Plan ID #${input.planId} not found`)
        }

        await this.planRepo.delete(input.planId)
    }
}

export type DeletePlanInput = {
    planId: string
}
