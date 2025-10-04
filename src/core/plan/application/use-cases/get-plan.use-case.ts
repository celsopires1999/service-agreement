import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { PlanRepository } from "../../domain/plan.repository"

export class GetPlanUseCase {
    constructor(private readonly planRepo: PlanRepository) {}

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
