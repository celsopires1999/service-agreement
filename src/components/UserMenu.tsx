import { auth } from "@/auth"
import { CircleUserIcon } from "lucide-react"
import { SignOut } from "./SignOut"
import { Button } from "./ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export async function UserMenu() {
    const session = await auth()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="User menu"
                    title="User menu"
                    className="rounded-full"
                >
                    <CircleUserIcon className="h-4 w-4" />
                    <span className="sr-only">User Menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start">
                    <span className="font-medium">{session?.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {session?.user.role}
                    </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <SignOut />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
