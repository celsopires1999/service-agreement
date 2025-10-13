import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { getServiceSearchResultsType } from "@/lib/queries/service"
import type { CellContext } from "@tanstack/react-table"
import {
    CpuIcon,
    Edit,
    EditIcon,
    EyeIcon,
    FileIcon,
    HandCoinsIcon,
    HandshakeIcon,
    MoreHorizontal,
    Plus,
    SheetIcon,
    Trash,
} from "lucide-react"
import Link from "next/link"

type ActionsCellProps = CellContext<getServiceSearchResultsType, unknown> & {
    handleDeleteService: (service: getServiceSearchResultsType) => void
}

export function ActionsCell({ row, handleDeleteService }: ActionsCellProps) {
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

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <HandshakeIcon className="mr-2 h-4 w-4" />
                        <span>Agreement</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
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
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <FileIcon className="mr-2 h-4 w-4" />
                        <span>Service</span>
                    </DropdownMenuSubTrigger>

                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {!row.original.isRevised && (
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
                            )}

                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/services/form?serviceId=${row.original.serviceId}`}
                                    className="flex w-full"
                                    prefetch={false}
                                >
                                    {row.original.isRevised ? (
                                        <>
                                            <EyeIcon className="mr-2 h-4 w-4" />
                                            <span>View</span>
                                        </>
                                    ) : (
                                        <>
                                            <EditIcon className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </>
                                    )}
                                </Link>
                            </DropdownMenuItem>

                            {!row.original.isRevised && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleDeleteService(row.original)
                                    }
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <SheetIcon className="mr-2 h-4 w-4" />
                        <span>User List</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/services/${row.original.serviceId}/users`}
                                    className="flex w-full"
                                    prefetch={false}
                                >
                                    {row.original.isRevised ? (
                                        <>
                                            <EyeIcon className="mr-2 h-4 w-4" />
                                            <span>View</span>
                                        </>
                                    ) : (
                                        <>
                                            <EditIcon className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </>
                                    )}
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <CpuIcon className="mr-2 h-4 w-4" />
                        <span>Systems</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/services/${row.original.serviceId}`}
                                    className="flex w-full"
                                    prefetch={false}
                                >
                                    <HandCoinsIcon className="mr-2 h-4 w-4" />
                                    <span>Allocation</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

ActionsCell.displayName = "ActionsCell"
