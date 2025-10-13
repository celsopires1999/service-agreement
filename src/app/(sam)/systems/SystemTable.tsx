"use client"
import { deleteSystemAction } from "@/actions/deleteSystemAction"
import { AlertConfirmation } from "@/app/components/AlertConfirmation"
import Deleting from "@/app/components/Deleting"
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
import type { getSystemType } from "@/lib/queries/system"
import {
    CellContext,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { IconButtonWithTooltip } from "@/app/components/IconButtonWithTooltip"
import { useTableStateHelper } from "@/hooks/useTableStateHelper"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ActionsCell } from "./ActionsCell"

type System = getSystemType

type SystemTableProps = {
    readonly data: System[]
}

export function SystemTable({ data }: SystemTableProps) {
    const router = useRouter()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [systemToDelete, setSystemToDelete] = useState<System | null>(null)

    const {
        executeAsync: executeDelete,
        isPending: isDeleting,
        reset: resetDeleteAction,
    } = useAction(deleteSystemAction, {
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

    const handleDeleteRequest = useCallback((system: System) => {
        setSystemToDelete(system)
        setShowDeleteConfirmation(true)
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        if (systemToDelete) {
            resetDeleteAction()
            await executeDelete({ systemId: systemToDelete.systemId })
        }
        setShowDeleteConfirmation(false)
        setSystemToDelete(null)
    }, [systemToDelete, executeDelete, resetDeleteAction])

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

    const handleFilterToggleChange = useCallback(
        (checked: boolean) => handleFilterToggle(checked),
        [handleFilterToggle],
    )

    const SortableHeader = ({
        children,
        column,
    }: {
        children: React.ReactNode
        column: import("@tanstack/react-table").Column<System, unknown>
    }) => (
        <Button
            variant="ghost"
            className="flex w-full justify-between pl-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {children}
            {column.getIsSorted() === "asc" && (
                <ArrowUp className="ml-2 h-4 w-4" />
            )}
            {column.getIsSorted() === "desc" && (
                <ArrowDown className="ml-2 h-4 w-4" />
            )}
        </Button>
    )

    const columns = useMemo(
        () => [
            {
                id: "actions",
                header: () => (
                    <IconButtonWithTooltip
                        text="New Agreement"
                        href="/systems/form"
                    />
                ),
                cell: (ctx: CellContext<System, unknown>) => (
                    <ActionsCell
                        {...ctx}
                        handleDeleteSystem={handleDeleteRequest}
                    />
                ),
                size: 48,
                enableColumnFilter: true,
            },
            {
                accessorKey: "name",
                header: ({
                    column,
                }: {
                    column: import("@tanstack/react-table").Column<
                        System,
                        unknown
                    >
                }) => <SortableHeader column={column}>System</SortableHeader>,
                cell: ({ row, getValue }: CellContext<System, unknown>) => (
                    <Link
                        href={`/systems/form?systemId=${row.original.systemId}`}
                        prefetch={false}
                    >
                        {getValue() as string}
                    </Link>
                ),
                size: 255,
                enableColumnFilter: true,
                enableSorting: true,
            },
            {
                accessorKey: "applicationId",
                header: ({
                    column,
                }: {
                    column: import("@tanstack/react-table").Column<
                        System,
                        unknown
                    >
                }) => (
                    <SortableHeader column={column}>
                        Application ID
                    </SortableHeader>
                ),
                size: 150,
                enableColumnFilter: true,
                enableSorting: true,
            },
            {
                accessorKey: "description",
                header: ({
                    column,
                }: {
                    column: import("@tanstack/react-table").Column<
                        System,
                        unknown
                    >
                }) => (
                    <SortableHeader column={column}>Description</SortableHeader>
                ),
                size: 500,
                enableSorting: true,
            },
        ],
        [handleDeleteRequest],
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
    }, [table])

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
                <h2 className="text-2xl font-bold">Systems List</h2>
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
                <Table>
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
            <div className="flex flex-wrap items-center justify-between gap-1">
                <div>
                    <p className="whitespace-nowrap font-bold">
                        {`Page ${table.getState().pagination.pageIndex + 1} of ${Math.max(1, table.getPageCount())}`}
                        &nbsp;&nbsp;
                        {`[${table.getFilteredRowModel().rows.length} ${table.getFilteredRowModel().rows.length === 1 ? "result" : "total results"}]`}
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
                                onClick={handleResetFilters}
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
                confirmationAction={handleConfirmDelete}
                title="Are you sure you want to delete this System?"
                message={`This action cannot be undone. This will permanently delete the system ${systemToDelete?.name}.`}
            />
            {isDeleting && <Deleting />}
        </div>
    )
}
