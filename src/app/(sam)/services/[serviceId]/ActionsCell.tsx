import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { getServiceSystemsSearchResultsType } from "@/lib/queries/serviceSystem"
import type { CellContext } from "@tanstack/react-table"
import { DollarSignIcon, Edit, MoreHorizontal, Trash } from "lucide-react"
import Link from "next/link"

type ActionsCellProps = CellContext<
    getServiceSystemsSearchResultsType,
    unknown
> & {
    isEditable: boolean
    handleUpdateServiceSystem: (systemId: string, allocation: string) => void
    handleDeleteServiceSystem: (serviceId: string, systemId: string) => void
}

export function ActionsCell({
    row,
    isEditable,
    handleUpdateServiceSystem,
    handleDeleteServiceSystem,
}: ActionsCellProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open Menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Allocation</DropdownMenuLabel>
                <DropdownMenuGroup>
                    {isEditable && (
                        <DropdownMenuItem
                            onClick={() =>
                                handleUpdateServiceSystem(
                                    row.original.systemId,
                                    row.original.allocation,
                                )
                            }
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                    )}
                    {isEditable && (
                        <DropdownMenuItem
                            onClick={() =>
                                handleDeleteServiceSystem(
                                    row.original.serviceId,
                                    row.original.systemId,
                                )
                            }
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
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
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

ActionsCell.displayName = "ActionsCell"
