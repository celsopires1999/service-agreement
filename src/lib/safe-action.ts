// import { NeonDbError } from "@neondatabase/serverless"
import { createSafeActionClient } from "next-safe-action"
import { PostgresError } from "postgres"
import { z } from "zod"
// import * as Sentry from '@sentry/nextjs'

export const actionClient = createSafeActionClient({
    defineMetadataSchema() {
        return z.object({
            actionName: z.string(),
        })
    },
    handleServerError(e, utils) {
        const { clientInput, metadata } = utils
        // Sentry.captureException(e, (scope) => {
        //     scope.clear()
        //     scope.setContext('serverError', { message: e.message })
        //     scope.setContext('metadata', { actionName: metadata?.actionName })
        //     scope.setContext('clientInput', { clientInput })
        //     return scope
        // })

        if (e.constructor.name === "PostgresError") {
            const { code, detail } = e as PostgresError
            if (code === "23503") {
                return `Related table exists. ${detail}`
            }
            if (code === "23505") {
                return `Unique entry required. ${detail}`
            }
        }

        const log = {
            message: e.message,
            actionName: metadata?.actionName,
            clientInput: clientInput,
        }
        console.error(log)

        if (e.constructor.name === "PostgresError") {
            return "Database Error: Your data did not save. Support will be notified."
        }
        return e.message
    },
})
