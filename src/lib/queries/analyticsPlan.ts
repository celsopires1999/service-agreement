import "server-only"

import { db } from "@/db"
import { analyticsPlans, plans } from "@/db/schema"
import { asc, eq } from "drizzle-orm"

export async function getAnalyticsPlans() {
    return db
        .select({
            planId: plans.planId,
            code: plans.code,
            planDate: plans.planDate,
            agreementsCount: analyticsPlans.agreementsCount,
            agreementsRevisedCount: analyticsPlans.agreementsRevisedCount,
            agreementsInProgressCount: analyticsPlans.agreementsInProgressCount,
            servicesCount: analyticsPlans.servicesCount,
            allocatedServicesCount: analyticsPlans.allocatedServicesCount,
            notAllocatedServicesCount: analyticsPlans.notAllocatedServicesCount,
            systemsCount: analyticsPlans.systemsCount,
            usersCount: analyticsPlans.usersCount,
            totalAmount: analyticsPlans.totalAmount,
        })
        .from(analyticsPlans)
        .innerJoin(plans, eq(analyticsPlans.planId, plans.planId))
        .orderBy(asc(plans.planDate))
}

export type getAnalyticsPlansType = Awaited<
    ReturnType<typeof getAnalyticsPlans>
>[number]
