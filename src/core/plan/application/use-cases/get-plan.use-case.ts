import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"

export class GetPlanUseCase {
    constructor(private readonly planRepo: PlanDrizzleRepository) {}

    async execute(input: GetPlanInput): Promise<GetPlanOutput> {
        const plan = await this.planRepo.find(input.planId)
        if (!plan) {
            throw new ValidationError(`Plan ID #${input.planId} not found`)
        }
        return plan.toJSON()
    }
}

export type GetPlanInput = {
    planId: string
}

export type GetPlanOutput = {
    planId: string
    code: string
    description: string
    euro: string
    planDate: string
}
