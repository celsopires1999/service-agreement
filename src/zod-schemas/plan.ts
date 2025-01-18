import { plans } from "@/db/schema"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const insertPlanSchema = createInsertSchema(plans)

export const selectPlanSchema = createSelectSchema(plans)

export type insertPlanSchemaType = typeof insertPlanSchema._type

export type selectPlanSchemaType = typeof selectPlanSchema._type
