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
import {
    ClapperboardIcon,
    Edit,
    MoreHorizontal,
    Plus,
    TablePropertiesIcon,
    Trash,
} from "lucide-react"
import Link from "next/link"
import type { CellContext } from "@tanstack/react-table"
import type { getAgreementSearchResultsType } from "@/lib/queries/agreement"

type ActionsCellProps = CellContext<getAgreementSearchResultsType, unknown> & {
    handleDeleteAgreement: (agreement: getAgreementSearchResultsType) => void
}

export function ActionsCell({ row, handleDeleteAgreement }: ActionsCellProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open Menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Agreement</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/agreements/form?agreementId=${row.original.agreementId}`}
                            className="flex w-full"
                            prefetch={false}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/agreements/${row.original.agreementId}/new-revision`}
                            className="flex w-full"
                            prefetch={false}
                        >
                            <ClapperboardIcon className="mr-2 h-4 w-4" />
                            <span>Revision</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleDeleteAgreement(row.original)}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Service</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/agreements/${row.original.agreementId}/services`}
                            className="flex w-full"
                            prefetch={false}
                        >
                            <TablePropertiesIcon className="mr-2 h-4 w-4" />
                            <span>List</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/services/form?agreementId=${row.original.agreementId}`}
                            className="flex w-full"
                            prefetch={false}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Add</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

ActionsCell.displayName = "ActionsCell"
