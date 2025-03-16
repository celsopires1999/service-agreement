"use client"

import { deleteServiceAction } from "@/actions/deleteServiceAction"
import { AlertConfirmation } from "@/components/AlertConfirmation"
import { AmountPresenter } from "@/components/AmountPresenter"
import Deleting from "@/components/Deleting"
import { Filter } from "@/components/react-table/Filter"
import { NoFilter } from "@/components/react-table/NoFilter"
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { useTableStateHelper } from "@/hooks/useTableStateHelper"
import { getServiceSearchResultsType } from "@/lib/queries/service"
import { amountFormatter, validatorEmailFormatter } from "@/lib/utils"
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
    ArrowDown,
    ArrowUp,
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
    TableOfContents,
    Trash,
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { JSX, useEffect, useState } from "react"

type Props = {
    data: getServiceSearchResultsType[]
}

export function ServiceTable({ data }: Props) {
    const router = useRouter()

    const searchParams = useSearchParams()

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [serviceToDelete, setServiceToDelete] =
        useState<getServiceSearchResultsType | null>(null)

    const [
        filterToggle,
        pageIndex,
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        handleFilterToggle,
        handlePage,
        handlePagination,
        handleSorting,
        handleColumnFilters,
    ] = useTableStateHelper()

    const handleDeleteService = (service: getServiceSearchResultsType) => {
        setServiceToDelete(service)
        setShowDeleteConfirmation(true)
    }

    const handleFilterToggleChange = (checked: boolean) => {
        if (!checked) {
            table.resetColumnFilters()
        }

        handleFilterToggle(checked)
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

    const columnHeadersArray: Array<keyof getServiceSearchResultsType> = [
        "name",
        "amount",
        "currency",
        "validatorEmail",
        "status",
        "agreementCode",
        "localPlan",
        "year",
        "revision",
    ]

    const columnDefs: Partial<{
        [K in keyof getServiceSearchResultsType]: {
            label: string
            width?: number
            filterable?: boolean
            transform?: (value: unknown) => string
            presenter?: ({ value }: { value: unknown }) => JSX.Element
        }
    }> = {
        name: { label: "Service", width: 500, filterable: true },
        amount: {
            label: "Amount",
            width: 1,
            transform: amountFormatter,
            presenter: AmountPresenter,
        },
        currency: { label: "Currency", width: 1, filterable: true },
        validatorEmail: {
            label: "Validator",
            width: 1,
            filterable: true,
            transform: validatorEmailFormatter,
        },
        status: { label: "Status", width: 1, filterable: true },
        agreementCode: { label: "Agreement", width: 1, filterable: true },
        localPlan: { label: "Local Plan", width: 1, filterable: true },
        year: { label: "Year", width: 1 },
        revision: { label: "Rev", width: 1 },
    }

    const columnHelper = createColumnHelper<getServiceSearchResultsType>()

    const ActionsCell = ({
        row,
    }: CellContext<getServiceSearchResultsType, unknown>) => (
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
                                    {!row.original.isRevised ? (
                                        <>
                                            <EditIcon className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </>
                                    ) : (
                                        <>
                                            <EyeIcon className="mr-2 h-4 w-4" />
                                            <span>View</span>
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
                                    {!row.original.isRevised ? (
                                        <>
                                            <EditIcon className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </>
                                    ) : (
                                        <>
                                            <EyeIcon className="mr-2 h-4 w-4" />
                                            <span>View</span>
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
                    const transformFn =
                        columnDefs[columnName as keyof typeof columnDefs]
                            ?.transform
                    if (transformFn) {
                        return transformFn(value)
                    }
                    return value
                },
                {
                    id: columnName,
                    size:
                        columnDefs[columnName as keyof typeof columnDefs]
                            ?.width ?? undefined,
                    enableColumnFilter:
                        columnDefs[columnName as keyof typeof columnDefs]
                            ?.filterable ?? false,
                    header: ({ column }) => {
                        return (
                            <Button
                                variant="ghost"
                                className="flex w-full justify-between pl-1"
                                onClick={() =>
                                    column.toggleSorting(
                                        column.getIsSorted() === "asc",
                                    )
                                }
                            >
                                {
                                    columnDefs[
                                        columnName as keyof typeof columnDefs
                                    ]?.label
                                }
                                {column.getIsSorted() === "asc" && (
                                    <ArrowUp className="ml-2 h-4 w-4" />
                                )}

                                {column.getIsSorted() === "desc" && (
                                    <ArrowDown className="ml-2 h-4 w-4" />
                                )}

                                {/* {column.getIsSorted() !== "desc" &&
                                    column.getIsSorted() !== "asc" && (
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    )} */}
                            </Button>
                        )
                    },
                    cell: (info) => {
                        // presentational
                        const presenterFn =
                            columnDefs[columnName as keyof typeof columnDefs]
                                ?.presenter

                        return (
                            <Link
                                href={`/services/form?serviceId=${info.row.original.serviceId}`}
                                prefetch={false}
                            >
                                {presenterFn ? (
                                    presenterFn({ value: info.getValue() })
                                ) : (
                                    <div>{info.getValue()?.toString()}</div>
                                )}
                            </Link>
                        )
                    },
                },
            )
        }),
    ]

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            pagination: {
                pageIndex,
                pageSize: 10,
            },
        },
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getSortedRowModel: getSortedRowModel(),
    })

    const handlePageChange = (direction: "previous" | "next") => {
        table.setPageIndex(handlePage(table.getState().pagination, direction))
    }

    useEffect(() => {
        handlePagination(table.getState().pagination, table.getPageCount())
    }, [table.getState().pagination]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        handleSorting(table.getState().sorting)
    }, [table.getState().sorting]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        handleColumnFilters(table.getState().columnFilters)
    }, [table.getState().columnFilters]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Services List</h2>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="filterToggle"
                        checked={filterToggle}
                        onCheckedChange={handleFilterToggleChange}
                    />
                    <Label htmlFor="filterToggle" className="font-semibold">
                        Filter
                    </Label>
                </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
                <Table className="border">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={`bg-secondary p-1 ${header.id === "actions" ? "w-12" : ""}`}
                                        style={
                                            header.id !== "actions"
                                                ? {
                                                      width: header.getSize(),
                                                  }
                                                : undefined
                                        }
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
                                        {filterToggle ? (
                                            header.column.getCanFilter() ? (
                                                <div className="grid w-max place-content-center">
                                                    <Filter
                                                        column={header.column}
                                                        filteredRows={table
                                                            .getFilteredRowModel()
                                                            .rows.map((row) =>
                                                                row.getValue(
                                                                    header
                                                                        .column
                                                                        .id,
                                                                ),
                                                            )}
                                                    />
                                                </div>
                                            ) : header.id ===
                                              "actions" ? null : (
                                                <NoFilter />
                                            )
                                        ) : null}
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
                            onClick={() => router.refresh()}
                        >
                            Refresh Data
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => table.resetSorting()}
                        >
                            Reset Sorting
                        </Button>
                        {filterToggle && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    table.resetColumnFilters()
                                    const params = new URLSearchParams(
                                        searchParams.toString(),
                                    )
                                    params.delete("filter")
                                    router.replace(`?${params.toString()}`, {
                                        scroll: false,
                                    })
                                }}
                            >
                                Reset Filters
                            </Button>
                        )}
                    </div>
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
