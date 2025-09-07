import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { PlanRepository } from "../../domain/plan.repository"

export class DeletePlanUseCase {
    constructor(private readonly planRepo: PlanRepository) {}

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
