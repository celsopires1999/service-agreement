import { Plan } from "./plan"

export interface PlanRepository {
    insert(plan: Plan): Promise<void>
    update(plan: Plan): Promise<void>
    delete(planId: string): Promise<void>
    find(planId: string): Promise<Plan | null>
}
