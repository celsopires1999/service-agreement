"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Props = {
    systemId?: string
    omit?: "system" | "cost"
}
export function SystemNav({ systemId, omit }: Props) {
    if (!systemId) {
        return null
    }

    return (
        <div className="flex">
            {omit === "system" ? null : (
                <Button variant="ghost" asChild>
                    <Link
                        href={`/systems/form?systemId=${systemId}`}
                        className="flex w-full"
                        prefetch={false}
                    >
                        <span>System</span> <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            )}

            {omit === "cost" ? null : (
                <Button variant="ghost" asChild>
                    <Link
                        href={`/systems/${systemId}`}
                        className="flex w-full"
                        prefetch={false}
                    >
                        <span>Cost</span> <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            )}
        </div>
    )
}
