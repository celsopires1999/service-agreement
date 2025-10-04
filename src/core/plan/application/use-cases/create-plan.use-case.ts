import { Plan } from "@/core/plan/domain/plan"
import { PlanRepository } from "../../domain/plan.repository"

export class CreatePlanUseCase {
    constructor(private readonly planRepo: PlanRepository) {}

    async execute(input: CreatePlanInput): Promise<CreatePlanOutput> {
        const plan = Plan.create(input)
        plan.validate()
        await this.planRepo.insert(plan)
        return { planId: plan.planId }
    }
}

export type CreatePlanInput = {
    code: string
    description: string
    euro: string
    planDate: string
}

export type CreatePlanOutput = {
    planId: string
}
