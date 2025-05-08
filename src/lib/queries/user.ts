import "server-only"

import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getUserByEmail(email: string) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
    return result[0]
}
