import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { getPlansType } from "@/lib/queries/plan"
import type { CellContext } from "@tanstack/react-table"
import { Edit, MoreHorizontal, Trash } from "lucide-react"

type ActionsCellProps = CellContext<getPlansType, unknown> & {
    handleUpdatePlan: (
        planId: string,
        code: string,
        description: string,
        euro: string,
        planDate: string,
    ) => void
    handleDeletePlan: (plan: getPlansType) => void
}

export function ActionsCell({
    row,
    handleUpdatePlan,
    handleDeletePlan,
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
                <DropdownMenuLabel>Plan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() =>
                        handleUpdatePlan(
                            row.original.planId,
                            row.original.code,
                            row.original.description,
                            row.original.euro,
                            row.original.planDate,
                        )
                    }
                >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleDeletePlan(row.original)}
                >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

ActionsCell.displayName = "ActionsCell"
