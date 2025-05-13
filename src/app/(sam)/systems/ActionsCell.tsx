import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { getSystemType } from "@/lib/queries/system"
import type { CellContext } from "@tanstack/react-table"
import { DollarSignIcon, Edit, MoreHorizontal, Trash } from "lucide-react"
import Link from "next/link"

type ActionsCellProps = CellContext<getSystemType, unknown> & {
    handleDeleteSystem: (system: getSystemType) => void
}

export function ActionsCell({ row, handleDeleteSystem }: ActionsCellProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open Menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>System</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/systems/form?systemId=${row.original.systemId}`}
                            className="flex w-full"
                            prefetch={false}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/systems/${row.original.systemId}`}
                            className="flex w-full"
                            prefetch={false}
                        >
                            <DollarSignIcon className="mr-2 h-4 w-4" />
                            <span>Cost</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleDeleteSystem(row.original)}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

ActionsCell.displayName = "ActionsCell"
