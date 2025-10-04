"use server"

import { flattenValidationErrors } from "next-safe-action"

import { CreatePlanUseCase } from "@/core/plan/application/use-cases/create-plan.use-case"
import { UpdatePlanUseCase } from "@/core/plan/application/use-cases/update-plan.use-case"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { db } from "@/db"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import { insertPlanSchema, type insertPlanSchemaType } from "@/zod-schemas/plan"
import { revalidatePath } from "next/cache"

export const savePlanAction = actionClient
    .metadata({ actionName: "savePlanAction" })
    .schema(insertPlanSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: plan,
        }: {
            parsedInput: insertPlanSchemaType
        }) => {
            const session = await getSession()

            if (session.user.role !== "admin") {
                throw new ValidationError("Unauthorized")
            }

            const planRepo = new PlanDrizzleRepository(db)

            if (plan.planId === "(New)") {
                const createPlan = new CreatePlanUseCase(planRepo)
                await createPlan.execute({
                    code: plan.code,
                    description: plan.description,
                    euro: plan.euro,
                    planDate: plan.planDate,
                })

                revalidatePath("/plans")

                return {
                    message: `Plan created successfully`,
                }
            }
            // Existing plan
            const updatePlan = new UpdatePlanUseCase(planRepo)
            await updatePlan.execute({
                planId: plan.planId,
                code: plan.code,
                description: plan.description,
                euro: plan.euro,
                planDate: plan.planDate,
            })
            revalidatePath("/plans")

            return {
                message: `Plan updated successfully`,
            }
        },
    )
