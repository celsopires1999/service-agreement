"use server"

import { signIn } from "@/auth"

export async function login(callbackUrl: string) {
    await signIn("github", { redirectTo: callbackUrl })
}
