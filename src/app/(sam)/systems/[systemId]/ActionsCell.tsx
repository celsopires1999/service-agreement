import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { getServicesBySystemIdType } from "@/lib/queries/service"
import type { CellContext } from "@tanstack/react-table"
import {
    FileIcon,
    HandCoinsIcon,
    HandshakeIcon,
    MoreHorizontal,
} from "lucide-react"
import Link from "next/link"

type ActionsCellProps = CellContext<getServicesBySystemIdType, unknown>

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
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href={`/agreements/form?agreementId=${row.original.agreementId}`}
                        className="flex w-full"
                        prefetch={false}
                    >
                        <HandshakeIcon className="mr-2 h-4 w-4" />
                        <span>Agreement</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href={`/services/form?serviceId=${row.original.serviceId}`}
                        className="flex w-full"
                        prefetch={false}
                    >
                        <FileIcon className="mr-2 h-4 w-4" />
                        <span>Service</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href={`/services/${row.original.serviceId}`}
                        className="flex w-full"
                        prefetch={false}
                    >
                        <HandCoinsIcon className="mr-2 h-4 w-4" />
                        Allocation
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

ActionsCell.displayName = "ActionsCell"
