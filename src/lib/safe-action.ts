import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { createSafeActionClient } from "next-safe-action"
import { DatabaseError } from "pg"
import { z } from "zod"

export const actionClient = createSafeActionClient({
    defineMetadataSchema() {
        return z.object({
            actionName: z.string(),
        })
    },
    handleServerError(e, utils) {
        const { clientInput, metadata } = utils

        if (e instanceof DatabaseError) {
            const { code, detail } = e
            if (code === "23503") {
                return `Relational key violation. ${detail}`
            }
            if (code === "23505") {
                return `Unique entry required. ${detail}`
            }
        }

        if (e instanceof ValidationError) {
            return e.message
        }

        const log = {
            time: new Date().toISOString(),
            message: e.message,
            actionName: metadata?.actionName,
            clientInput: clientInput,
        }
        console.error(log)

        if (e instanceof DatabaseError) {
            return "Database Error: Your data did not save. Support will be notified."
        }
        return e.message
    },
})
