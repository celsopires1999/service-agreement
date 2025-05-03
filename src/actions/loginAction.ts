"use server"

import { signIn } from "@/auth"

export async function login(callbackUrl: string) {
    await signIn("", { redirectTo: callbackUrl })
    // await signIn("azure-ad", { redirectTo: callbackUrl })
}
