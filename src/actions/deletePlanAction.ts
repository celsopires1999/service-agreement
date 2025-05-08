"use server"

import { db } from "@/db"
import { plans } from "@/db/schema"
import { getSession } from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"
import { eq } from "drizzle-orm"
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
            await getSession()
            const result = await db
                .delete(plans)
                .where(eq(plans.planId, params.planId))
                .returning({ deletedId: plans.planId })

            revalidatePath(`/systems/`)

            return {
                message: `Plan ID #${result[0].deletedId} deleted successfully.`,
            }
        },
    )
