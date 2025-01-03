import "server-only"

import { db } from "@/db"
import { currencies } from "@/db/schema"
import { and, eq } from "drizzle-orm"

export async function getCurrency(year: number, currency: "EUR" | "USD") {
    return db
        .select({
            year: currencies.year,
            currency: currencies.currency,
            value: currencies.value,
        })
        .from(currencies)
        .where(
            and(eq(currencies.year, year), eq(currencies.currency, currency)),
        )
        .limit(1)
}
