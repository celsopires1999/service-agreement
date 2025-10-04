import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { PlanRepository } from "../../domain/plan.repository"

export class UpdatePlanUseCase {
    constructor(private readonly planRepo: PlanRepository) {}

    async execute(input: UpdatePlanInput): Promise<void> {
        const plan = await this.planRepo.find(input.planId)
        if (!plan) {
            throw new ValidationError(`Plan ID #${input.planId} not found`)
        }

        input.code && plan.changeCode(input.code)
        input.description && plan.changeDescription(input.description)
        input.euro && plan.changeEuro(input.euro)
        input.planDate && plan.changePlanDate(input.planDate)

        plan.validate()

        await this.planRepo.update(plan)
    }
}

export type UpdatePlanInput = {
    planId: string
    code?: string
    description?: string
    euro?: string
    planDate?: string
}
