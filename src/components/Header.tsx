import {
    CpuIcon,
    EuroIcon,
    FileIcon,
    HandshakeIcon,
    HomeIcon,
    UsersRoundIcon,
} from "lucide-react"
import Link from "next/link"
// import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
// import { Button } from "@/components/ui/button"
import { NavButton } from "@/components/NavButton"
import { ModeToggle } from "./ModeToggle"
import { NavButtonMenu } from "./NavButtonMenu"
import { UserMenu } from "./UserMenu"

export function Header() {
    return (
        <header className="sticky top-0 z-20 h-12 animate-slide border-b bg-background p-2">
            <div className="flex h-8 w-full items-center justify-between">
                <div className="flex items-center gap-2">
                    <NavButton
                        icon={HomeIcon}
                        label="Home"
                        href="/agreements"
                    />

                    <Link
                        href="/agreements"
                        className="ml-0 flex items-center justify-center gap-2"
                        title="Home"
                    >
                        <h1 className="m-0 mt-1 hidden text-xl font-bold sm:block">
                            Service Agreement Validation
                        </h1>
                    </Link>
                </div>
                <div className="flex items-center">
                    <NavButtonMenu
                        icon={HandshakeIcon}
                        label="Agreements"
                        choices={[
                            { title: "Search Agreements", href: "/agreements" },
                            {
                                title: "New Agreement",
                                href: "/agreements/form",
                            },
                        ]}
                    />

                    <NavButton
                        icon={FileIcon}
                        label="Services"
                        href="/services"
                    />

                    <NavButtonMenu
                        icon={CpuIcon}
                        label="Systems"
                        choices={[
                            { title: "Search Systems", href: "/systems" },
                            { title: "New System", href: "/systems/form" },
                        ]}
                    />

                    <NavButton
                        icon={EuroIcon}
                        label="Company Plans"
                        href="/plans"
                    />

                    <NavButtonMenu
                        icon={UsersRoundIcon}
                        label="Users"
                        choices={[
                            { title: "Search Users", href: "/users" },
                            { title: "New User", href: "/users/form" },
                        ]}
                    />

                    <ModeToggle />
                    <UserMenu />
                </div>
            </div>
        </header>
    )
}
