import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { getUserListItemsByServiceIdType } from "@/lib/queries/userList"
import type { CellContext } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

type ActionsCellProps = CellContext<getUserListItemsByServiceIdType, unknown>

export function ActionsCell({ row }: ActionsCellProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open Menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{row.original.corpUserId}</DropdownMenuLabel>
                <DropdownMenuGroup></DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

ActionsCell.displayName = "ActionsCell"
