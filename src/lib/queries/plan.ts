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
        })
        .from(plans)
        .orderBy(desc(plans.code))
}

export type getPlansType = Awaited<ReturnType<typeof getPlans>>[number]
