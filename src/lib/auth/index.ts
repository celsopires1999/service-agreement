import "server-only"

import { login } from "@/actions/loginAction"
import { auth } from "@/auth"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { redirect } from "next/navigation"

export async function getSession(
    pathname?: string,
    params?: {
        [key: string]: string | undefined
    },
) {
    const searchParams = new URLSearchParams()

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value) searchParams.append(key, value)
        })
    }

    const session = await auth()

    if (!pathname) {
        if (!session) {
            throw new ValidationError("You are not logged in")
        }
        return session
    }

    const queryString = searchParams.toString()
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname

    if (!session) await login(fullPath)

    if (!session?.user?.role) {
        redirect("/not-authorized")
    }

    return session
}
