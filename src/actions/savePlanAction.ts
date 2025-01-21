"use server"

import { eq } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"

import { db } from "@/db"
import { plans } from "@/db/schema"
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
            if (plan.planId === "(New)") {
                const result = await db
                    .insert(plans)
                    .values({
                        code: plan.code,
                        description: plan.description,
                        euro: plan.euro,
                    })
                    .returning({ createdAt: plans.createdAt })

                revalidatePath("/plans")

                return {
                    message: `Plan created successfully`,
                    createdAt: result[0].createdAt,
                }
            }
            // Existing plan
            // updatedAt is set by the database
            const result = await db
                .update(plans)
                .set({
                    code: plan.code,
                    description: plan.description,
                    euro: plan.euro,
                })
                .where(eq(plans.planId, plan.planId))
                .returning({ updatedAt: plans.updatedAt })

            revalidatePath("/plans")

            return {
                message: `Plan updated successfully`,
                createdAt: result[0].updatedAt,
            }
        },
    )