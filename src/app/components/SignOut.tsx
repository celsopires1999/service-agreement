import { logout } from "@/actions/logoutAction"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SignOut() {
    return (
        <form action={logout}>
            <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label="LogOut"
                title="Log Out"
                className="rounded-full"
            >
                <LogOut />
            </Button>
        </form>
    )
}
