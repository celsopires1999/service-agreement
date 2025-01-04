"use server"

import { eq, and } from "drizzle-orm"
import { flattenValidationErrors } from "next-safe-action"

import { db } from "@/db"
import { currencies } from "@/db/schema"
import { actionClient } from "@/lib/safe-action"
import {
    insertCurrencySchema,
    type insertCurrencySchemaType,
} from "@/zod-schemas/currency"
import { revalidatePath } from "next/cache"

export const saveCurrencyAction = actionClient
    .metadata({ actionName: "saveCurrencyAction" })
    .schema(insertCurrencySchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({
            parsedInput: currency,
        }: {
            parsedInput: insertCurrencySchemaType
        }) => {
            const exists = await db
                .select()
                .from(currencies)
                .where(
                    and(
                        eq(currencies.year, currency.year),
                        eq(currencies.currency, currency.currency),
                    ),
                )
                .limit(1)

            if (exists.length === 0) {
                const result = await db
                    .insert(currencies)
                    .values({
                        year: currency.year,
                        currency: currency.currency,
                        value: currency.value,
                    })
                    .returning({ createdAt: currencies.createdAt })

                revalidatePath("/currencies")

                return {
                    message: `Currency created successfully`,
                    createdAt: result[0].createdAt,
                }
            }
            // Existing currency
            // updatedAt is set by the database
            const result = await db
                .update(currencies)
                .set({
                    year: currency.year,
                    currency: currency.currency,
                    value: currency.value,
                })
                .where(
                    and(
                        eq(currencies.year, currency.year),
                        eq(currencies.currency, currency.currency),
                    ),
                )
                .returning({ updatedAt: currencies.updatedAt })

            revalidatePath("/currencies")

            return {
                message: `Currency updated successfully`,
                createdAt: result[0].updatedAt,
            }
        },
    )
