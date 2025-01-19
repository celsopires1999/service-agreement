"use client"
import { deleteServiceAction } from "@/actions/deleteServiceAction"
import { AlertConfirmation } from "@/components/AlertConfirmation"
import Deleting from "@/components/Deleting"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { getServiceSearchResultsType } from "@/lib/queries/service"
import {
    CellContext,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    CircleCheckIcon,
    CircleXIcon,
    MoreHorizontal,
    TableOfContents,
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

type Props = {
    data: getServiceSearchResultsType[]
}

export function ServiceTable({ data }: Props) {
    const router = useRouter()

    const searchParams = useSearchParams()

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [serviceToDelete, setServiceToDelete] =
        useState<getServiceSearchResultsType | null>(null)

    const handleDeleteService = (service: getServiceSearchResultsType) => {
        setServiceToDelete(service)
        setShowDeleteConfirmation(true)
    }

    const {
        executeAsync: executeDelete,
        isPending: isDeleting,
        reset: resetDeleteAction,
    } = useAction(deleteServiceAction, {
        onSuccess({ data }) {
            if (data?.message) {
                toast({
                    variant: "default",
                    title: "Success! 🎉",
                    description: data.message,
                })
            }
        },
        onError({ error }) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.serverError,
            })
        },
    })

    const confirmDeleteService = async () => {
        if (serviceToDelete) {
            resetDeleteAction()
            try {
                await executeDelete({
                    serviceId: serviceToDelete.serviceId,
                })
            } catch (error) {
                if (error instanceof Error) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: `Action error: ${error.message}`,
                    })
                }
            }
        }
        setShowDeleteConfirmation(false)
        setServiceToDelete(null)
    }

    const pageIndex = useMemo(() => {
        const page = searchParams.get("page")
        return page ? +page - 1 : 0
    }, [searchParams.get("page")]) // eslint-disable-line react-hooks/exhaustive-deps

    const columnHeadersArray: Array<keyof getServiceSearchResultsType> = [
        "name",
        "amount",
        "currency",
        "agreementCode",
        "agreementName",
        "localPlan",
        "year",
        "revision",
        "isRevised",
        "revisionDate",
    ]

    const columnLabels: Partial<{
        [K in keyof getServiceSearchResultsType]: string
    }> = {
        name: "Service",
        amount: "Amount",
        currency: "Currency",
        agreementCode: "Agreement",
        agreementName: "Name",
        localPlan: "Local Plan",
        year: "Year",
        revision: "Revision",
        isRevised: "Revised",
        revisionDate: "Date",
    }

    const columnWidths: Partial<{
        [K in keyof typeof columnLabels]: number
    }> = {
        amount: 150,
        currency: 150,
        localPlan: 150,
        year: 150,
        revision: 150,
        isRevised: 150,
        revisionDate: 150,
    }

    const columnHelper = createColumnHelper<getServiceSearchResultsType>()

    const ActionsCell = ({
        row,
    }: CellContext<getServiceSearchResultsType, unknown>) => {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open Menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {!row.original.isRevised && (
                        <DropdownMenuItem>
                            <Link
                                href={`/services/form?agreementId=${row.original.agreementId}`}
                                className="w-full"
                                prefetch={false}
                            >
                                New Service
                            </Link>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem>
                        <Link
                            href={`/services/form?serviceId=${row.original.serviceId}`}
                            className="w-full"
                            prefetch={false}
                        >
                            {!row.original.isRevised
                                ? "Edit Service"
                                : "View Service"}
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Link
                            href={`/services/${row.original.serviceId}`}
                            className="w-full"
                            prefetch={false}
                        >
                            Systems
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Link
                            href={`/agreements/form?agreementId=${row.original.agreementId}`}
                            className="w-full"
                            prefetch={false}
                        >
                            Edit Agreement
                        </Link>
                    </DropdownMenuItem>

                    {!row.original.isRevised && (
                        <DropdownMenuItem
                            onClick={() => handleDeleteService(row.original)}
                        >
                            Delete Service
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    ActionsCell.displayName = "ActionsCell"

    const columns = [
        columnHelper.display({
            id: "actions",
            header: () => <TableOfContents />,
            cell: ActionsCell,
        }),
        ...columnHeadersArray.map((columnName) => {
            return columnHelper.accessor(
                (row) => {
                    // transformational
                    const value = row[columnName]
                    if (columnName === "amount") {
                        return new Intl.NumberFormat("pt-BR", {
                            style: "decimal",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(+value)
                    }

                    if (
                        columnName === "revisionDate" &&
                        typeof value === "string"
                    ) {
                        return value
                            ? new Intl.DateTimeFormat("pt-BR", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                              }).format(
                                  new Date(
                                      +value.substring(0, 4),
                                      +value.substring(5, 7) - 1,
                                      +value.substring(8, 10),
                                  ),
                              )
                            : ""
                    }

                    return value
                },
                {
                    id: columnName,
                    size:
                        columnWidths[columnName as keyof typeof columnWidths] ??
                        undefined,
                    header: () =>
                        columnLabels[columnName as keyof typeof columnLabels],
                    cell: (info) => {
                        if (columnName === "amount") {
                            return (
                                <div className="text-right">
                                    {info.renderValue()}
                                </div>
                            )
                        }

                        if (columnName === "isRevised") {
                            return (
                                <div className="grid place-content-center">
                                    {info.getValue() === false ? (
                                        <CircleXIcon className="opacity-25" />
                                    ) : (
                                        <CircleCheckIcon className="text-green-600" />
                                    )}
                                </div>
                            )
                        }

                        return info.renderValue()
                    },
                },
            )
        }),
    ]

    const table = useReactTable({
        data,
        columns,
        state: {
            pagination: {
                pageIndex,
                pageSize: 10,
            },
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getSortedRowModel: getSortedRowModel(),
    })

    const handlePageChange = (direction: "previous" | "next") => {
        const index = direction === "previous" ? -1 : +1
        const newIndex = table.getState().pagination.pageIndex + index
        table.setPageIndex(newIndex)
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", (newIndex + 1).toString())
        router.replace(`?${params.toString()}`, {
            scroll: false,
        })
    }

    return (
        <div className="mt-6 flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Services List</h2>
            <div className="overflow-hidden rounded-lg border border-border">
                <Table className="border">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={`bg-secondary font-semibold ${header.id === "actions" ? "w-12" : ""}`}
                                    >
                                        <div
                                            className={`${header.id === "actions" ? "flex items-center justify-center" : ""}`}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                className="hover:bg-border/25 dark:hover:bg-ring/40"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="border">
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1">
                <div>
                    <p className="whitespace-nowrap font-bold">
                        {`Page ${table.getState().pagination.pageIndex + 1} of ${Math.max(1, table.getPageCount())}`}
                        &nbsp;&nbsp;
                        {`[${table.getFilteredRowModel().rows.length} ${table.getFilteredRowModel().rows.length !== 1 ? "total results" : "result"}]`}
                    </p>
                </div>
                <div className="flex flex-row gap-1">
                    <div className="flex flex-row gap-1">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange("previous")}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange("next")}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
            <AlertConfirmation
                open={showDeleteConfirmation}
                setOpen={setShowDeleteConfirmation}
                confirmationAction={confirmDeleteService}
                title="Are you sure you want to delete this Service?"
                message={`This action cannot be undone. This will permanently delete the service ${serviceToDelete?.name}.`}
            />
            {isDeleting && <Deleting />}
        </div>
    )
}
