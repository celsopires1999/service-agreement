import "server-only"

import { db } from "@/db"
import { plans } from "@/db/schema"
import { desc, eq } from "drizzle-orm"

export async function getPlan(planId: string) {
    return db.select().from(plans).where(eq(plans.planId, planId)).limit(1)
}

export async function getPlans() {
    return db
        .select({
            planId: plans.planId,
            code: plans.code,
            description: plans.description,
            euro: plans.euro,
            planDate: plans.planDate,
        })
        .from(plans)
        .orderBy(desc(plans.code))
}

export type getPlansType = Awaited<ReturnType<typeof getPlans>>[number]

export async function getPlansForSelect() {
    try {
        const plansResult = await getPlans()
        const plans = plansResult.map((plan) => ({
            id: plan.planId,
            description: plan.code,
        }))
        return plans
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
        } else {
            console.log(error)
        }
        return []
    }
}

export async function getPlansForSearch() {
    try {
        const plansResult = await getPlans()
        const plans = plansResult.map((plan) => ({
            id: plan.planId,
            description: plan.code,
        }))
        plans.push({ id: "all", description: "All Local Plans" })
        return plans
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
        } else {
            console.log(error)
        }
        return [{ id: "all", description: "All Local Plans" }]
    }
}
