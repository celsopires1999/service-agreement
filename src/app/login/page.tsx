import { login } from "@/actions/loginAction"
import { Button } from "@/components/ui/button"

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { callbackUrl } = await searchParams

    const handlelogin = async () => {
        "use server"
        await login(callbackUrl ?? "/agreements")
    }

    return (
        <main className="flex h-dvh flex-col items-center gap-6 p-4 text-4xl">
            <h1>Service Agreement Validation </h1>
            <form action={handlelogin}>
                <Button
                    type="submit"
                    variant="default"
                    size="default"
                    aria-label="Sign In"
                >
                    Sign In
                </Button>
            </form>
        </main>
    )
}
