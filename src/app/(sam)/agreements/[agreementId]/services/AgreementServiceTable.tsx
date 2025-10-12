"use client"

import { deleteServiceAction } from "@/actions/deleteServiceAction"
import { AlertConfirmation } from "@/app/components/AlertConfirmation"
import { AmountPresenter } from "@/app/components/AmountPresenter"
import Deleting from "@/app/components/Deleting"
import { IconButtonWithTooltip } from "@/app/components/IconButtonWithTooltip"
import { Filter } from "@/components/react-table/Filter"
import { NoFilter } from "@/components/react-table/NoFilter"
import { Button } from "@/components/ui/button"
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
import { getAgreementType } from "@/lib/queries/agreement"
import { getServiceSearchResultsType } from "@/lib/queries/service"
import { amountFormatter, validatorEmailFormatter } from "@/lib/utils"
import {
    Column,
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    Table as TanstackTable,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, Plus } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { ActionsCell } from "./ActionsCell"
import { AgreementServiceHeader } from "./AgreementServiceHeader"

type Service = getServiceSearchResultsType

type AgreementServiceTableProps = {
    readonly data: Service[]
    readonly agreement: getAgreementType
}

type TableToolbarProps = {
    filterToggle: boolean
    onFilterToggleChange: (checked: boolean) => void
    agreement: getAgreementType
}

const TableToolbar = memo(function TableToolbar({
    filterToggle,
    onFilterToggleChange,
    agreement,
}: TableToolbarProps) {
    return (
        <AgreementServiceHeader
            title="Agreement Services"
            agreement={agreement}
        >
            <div className="flex items-center space-x-2">
                <Switch
                    id="filterToggle"
                    checked={filterToggle}
                    onCheckedChange={onFilterToggleChange}
                />
                <Label htmlFor="filterToggle" className="font-semibold">
                    Filter
                </Label>
            </div>
        </AgreementServiceHeader>
    )
})

type TablePaginationProps = {
    table: TanstackTable<Service>
    onPageChange: (direction: "previous" | "next") => void
    onRefresh: () => void
    onResetSorting: () => void
    onResetFilters: () => void
    filterToggle: boolean
}

const TablePagination = memo(function TablePagination({
    table,
    onPageChange,
    onRefresh,
    onResetSorting,
    onResetFilters,
    filterToggle,
}: TablePaginationProps) {
    const { pageIndex } = table.getState().pagination
    const pageCount = table.getPageCount()
    const filteredRowsCount = table.getFilteredRowModel().rows.length
    return (
        <div className="flex flex-wrap items-center justify-between gap-1">
            <div>
                <p className="whitespace-nowrap font-bold">
                    {`Page ${pageIndex + 1} of ${Math.max(1, pageCount)}`}
                    &nbsp;&nbsp;
                    {`[${filteredRowsCount} ${filteredRowsCount === 1 ? "result" : "total results"}]`}
                </p>
            </div>
            <div className="flex flex-row gap-1">
                <div className="flex flex-row gap-1">
                    <Button variant="outline" onClick={onRefresh}>
                        Refresh Data
                    </Button>
                    <Button variant="outline" onClick={onResetSorting}>
                        Reset Sorting
                    </Button>
                    {filterToggle && (
                        <Button variant="outline" onClick={onResetFilters}>
                            Reset Filters
                        </Button>
                    )}
                </div>
                <div className="flex flex-row gap-1">
                    <Button
                        variant="outline"
                        onClick={() => onPageChange("previous")}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onPageChange("next")}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
})

const SortableHeader = ({
    children,
    column,
}: {
    children: React.ReactNode
    column: Column<Service, unknown>
}) => (
    <Button
        variant="ghost"
        className="flex w-full justify-between pl-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        {children}
        {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
        {column.getIsSorted() === "desc" && (
            <ArrowDown className="ml-2 h-4 w-4" />
        )}
    </Button>
)

export function AgreementServiceTable({
    data,
    agreement,
}: AgreementServiceTableProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)

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

    const {
        executeAsync: executeDelete,
        isPending: isDeleting,
        reset: resetDeleteAction,
    } = useAction(deleteServiceAction, {
        onSuccess: useCallback(({ data }: { data?: { message?: string } }) => {
            if (data?.message) {
                toast({
                    variant: "default",
                    title: "Success! 🎉",
                    description: data.message,
                })
            }
        }, []),
        onError: useCallback(
            ({ error }: { error: { serverError?: string } }) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.serverError,
                })
            },
            [],
        ),
    })

    const handleDeleteRequest = useCallback((service: Service) => {
        setServiceToDelete(service)
        setShowDeleteConfirmation(true)
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        if (serviceToDelete) {
            resetDeleteAction()
            await executeDelete({ serviceId: serviceToDelete.serviceId })
        }
        setShowDeleteConfirmation(false)
        setServiceToDelete(null)
    }, [serviceToDelete, executeDelete, resetDeleteAction])

    const handleFilterToggleChange = useCallback(
        (checked: boolean) => handleFilterToggle(checked),
        [handleFilterToggle],
    )

    const columns = useMemo<ColumnDef<Service>[]>(
        () => [
            {
                id: "actions",
                header: () => (
                    <IconButtonWithTooltip
                        text="New Service"
                        href={`/services/form?agreementId=${agreement.agreementId}`}
                    />
                ),
                cell: (ctx) => (
                    <ActionsCell
                        {...ctx}
                        handleDeleteService={handleDeleteRequest}
                    />
                ),
                size: 48,
            },
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <SortableHeader column={column}>Service</SortableHeader>
                ),
                cell: ({ row, getValue }) => (
                    <Link
                        href={`/services/form?serviceId=${row.original.serviceId}`}
                        prefetch={false}
                    >
                        {getValue<string>()}
                    </Link>
                ),
                enableColumnFilter: true,
                size: 500,
            },
            {
                accessorKey: "amount",
                header: ({ column }) => (
                    <SortableHeader column={column}>Amount</SortableHeader>
                ),
                cell: ({ getValue }) => (
                    <AmountPresenter
                        value={amountFormatter(getValue<string>())}
                    />
                ),
                size: 1,
                enableColumnFilter: false,
            },
            {
                accessorKey: "currency",
                header: ({ column }) => (
                    <SortableHeader column={column}>Currency</SortableHeader>
                ),
                enableColumnFilter: true,
                size: 1,
            },
            {
                accessorKey: "validatorEmail",
                header: ({ column }) => (
                    <SortableHeader column={column}>Validator</SortableHeader>
                ),
                cell: ({ getValue }) =>
                    validatorEmailFormatter(getValue<string>()),
                enableColumnFilter: true,
                size: 1,
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <SortableHeader column={column}>Status</SortableHeader>
                ),
                enableColumnFilter: true,
                size: 1,
            },
        ],
        [agreement.agreementId, handleDeleteRequest],
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            pagination: { pageIndex, pageSize: 10 },
        },
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getSortedRowModel: getSortedRowModel(),
    })

    const handlePageChange = useCallback(
        (direction: "previous" | "next") => {
            table.setPageIndex(
                handlePage(table.getState().pagination, direction),
            )
        },
        [handlePage, table],
    )

    const handleResetFilters = useCallback(() => {
        table.resetColumnFilters()
        // Remove filter param from URL if present
        const params = new URLSearchParams(searchParams.toString())
        params.delete("filter")
        router.replace(`?${params.toString()}`, { scroll: false })
    }, [router, searchParams, table])

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
        <div className="flex flex-col gap-1 sm:px-8">
            <TableToolbar
                filterToggle={filterToggle}
                onFilterToggleChange={handleFilterToggleChange}
                agreement={agreement}
            />

            {data.length === 0 && (
                <div>
                    <Button variant="ghost" asChild>
                        <Link
                            href={`/services/form?agreementId=${agreement.agreementId}`}
                            prefetch={false}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add First Service</span>
                        </Link>
                    </Button>
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-border">
                <Table className="border">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="bg-secondary p-1 font-semibold"
                                        style={{ width: header.getSize() }}
                                    >
                                        <div
                                            className={
                                                header.id === "actions"
                                                    ? "flex items-center justify-center"
                                                    : ""
                                            }
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                        </div>
                                        {filterToggle &&
                                            header.column.getCanFilter() && (
                                                <div className="grid place-items-start">
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
                                            )}
                                        {filterToggle &&
                                            !header.column.getCanFilter() &&
                                            header.id !== "actions" && (
                                                <NoFilter />
                                            )}
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

            <TablePagination
                table={table}
                onPageChange={handlePageChange}
                onRefresh={() => router.refresh()}
                onResetSorting={() => table.resetSorting()}
                onResetFilters={handleResetFilters}
                filterToggle={filterToggle}
            />

            <AlertConfirmation
                open={showDeleteConfirmation}
                setOpen={setShowDeleteConfirmation}
                confirmationAction={handleConfirmDelete}
                title="Are you sure you want to delete this Service?"
                message={`This action cannot be undone. This will permanently delete the service ${serviceToDelete?.name}.`}
            />
            {isDeleting && <Deleting />}
        </div>
    )
}
