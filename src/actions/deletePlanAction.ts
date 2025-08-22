"use server"

import { DeletePlanUseCase } from "@/core/plan/application/use-cases/delete-plan.use-case"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { db } from "@/db"
import { plans } from "@/db/schema"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import { eq } from "drizzle-orm"
import { Delete } from "lucide-react"
import { flattenValidationErrors } from "next-safe-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const deletePlanSchema = z.object({
    planId: z.string().uuid("invalid UUID"),
})

export type deletePlanSchemaType = typeof deletePlanSchema._type

export const deletePlanAction = actionClient
    .metadata({ actionName: "deletePlanAction" })
    .schema(deletePlanSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: params,
        }: {
            parsedInput: deletePlanSchemaType
        }) => {
            const session = await getSession()

            if (session.user.role !== "admin") {
                throw new ValidationError("Unauthorized")
            }

            const deletePlan = new DeletePlanUseCase(
                new PlanDrizzleRepository(db),
            )
            await deletePlan.execute({ planId: params.planId })

            revalidatePath("/plans")

            return {
                message: `Plan ID #${params.planId} deleted successfully.`,
            }
        },
    )
