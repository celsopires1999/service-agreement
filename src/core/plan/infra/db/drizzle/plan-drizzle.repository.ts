import { Plan } from "@/core/plan/domain/plan"
import { PlanRepository } from "@/core/plan/domain/plan.repository"
import { DB } from "@/db"
import { plans } from "@/db/schema"
import { eq } from "drizzle-orm"

export class PlanDrizzleRepository implements PlanRepository {
    constructor(private readonly db: DB) {}
    async insert(plan: Plan): Promise<void> {
        await this.db.insert(plans).values({
            planId: plan.planId,
            code: plan.code,
            description: plan.description,
            euro: plan.euro,
            planDate: plan.planDate,
        })
    }

    async update(plan: Plan): Promise<void> {
        await this.db
            .update(plans)
            .set({
                code: plan.code,
                description: plan.description,
                euro: plan.euro,
                planDate: plan.planDate,
            })
            .where(eq(plans.planId, plan.planId))
    }

    async delete(planId: string): Promise<void> {
        await this.db.delete(plans).where(eq(plans.planId, planId))
    }

    async find(planId: string): Promise<Plan | null> {
        const result = await this.db.query.plans.findFirst({
            where: eq(plans.planId, planId),
        })

        if (!result) {
            return null
        }

        return new Plan(result)
    }
}
