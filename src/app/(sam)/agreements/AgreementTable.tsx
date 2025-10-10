"use client"

import { deleteAgreementAction } from "@/actions/deleteAgreementAction"
import { AlertConfirmation } from "@/app/components/AlertConfirmation"
import Deleting from "@/app/components/Deleting"
import { IconButtonWithTooltip } from "@/app/components/IconButtonWithTooltip"
import { IsRevisedPresenter } from "@/app/components/IsRevisedPresenter"
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
import { getAgreementSearchResultsType } from "@/lib/queries/agreement"
import { dateFormatter } from "@/lib/utils"
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
import { ArrowDown, ArrowUp } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { memo, useCallback, useMemo, useState } from "react"
import { ActionsCell } from "./ActionsCell"

type Agreement = getAgreementSearchResultsType

type AgreementTableProps = {
    readonly data: Agreement[]
}

type TableToolbarProps = {
    filterToggle: boolean
    onFilterToggleChange: (checked: boolean) => void
}

const TableToolbar = memo(function TableToolbar({
    filterToggle,
    onFilterToggleChange,
}: TableToolbarProps) {
    return (
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Agreements List</h2>
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
        </div>
    )
})

type TablePaginationProps = {
    table: TanstackTable<Agreement>
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
    column: Column<Agreement, unknown>
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

export function AgreementTable({ data }: AgreementTableProps) {
    const router = useRouter()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [agreementToDelete, setAgreementToDelete] =
        useState<Agreement | null>(null)

    const [
        filterToggle,
        pageIndex,
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        handleFilterToggle,
        handlePage,
    ] = useTableStateHelper()

    const {
        executeAsync: executeDelete,
        isPending: isDeleting,
        reset: resetDeleteAction,
    } = useAction(deleteAgreementAction, {
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

    const handleDeleteRequest = useCallback((agreement: Agreement) => {
        setAgreementToDelete(agreement)
        setShowDeleteConfirmation(true)
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        if (agreementToDelete) {
            resetDeleteAction()
            await executeDelete({ agreementId: agreementToDelete.agreementId })
        }
        setShowDeleteConfirmation(false)
        setAgreementToDelete(null)
    }, [agreementToDelete, executeDelete, resetDeleteAction])

    const handleFilterToggleChange = useCallback(
        (checked: boolean) => {
            if (!checked) {
                setColumnFilters([])
            }
            handleFilterToggle(checked)
        },
        [handleFilterToggle, setColumnFilters],
    )

    const columns = useMemo<ColumnDef<Agreement>[]>(
        () => [
            {
                id: "actions",
                header: () => (
                    <IconButtonWithTooltip
                        text="New Agreement"
                        href="/agreements/form"
                    />
                ),
                cell: (ctx) => (
                    <ActionsCell
                        {...ctx}
                        handleDeleteAgreement={handleDeleteRequest}
                    />
                ),
                size: 48,
            },
            {
                accessorKey: "code",
                header: ({ column }) => (
                    <SortableHeader column={column}>Code</SortableHeader>
                ),
                cell: ({ row, getValue }) => (
                    <Link
                        href={`/agreements/form?agreementId=${row.original.agreementId}`}
                        prefetch={false}
                    >
                        {getValue<string>()}
                    </Link>
                ),
                enableColumnFilter: true,
                size: 255,
            },
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <SortableHeader column={column}>Agreement</SortableHeader>
                ),
                enableColumnFilter: true,
                size: 500,
            },
            {
                accessorKey: "contactEmail",
                header: ({ column }) => (
                    <SortableHeader column={column}>
                        Contact Email
                    </SortableHeader>
                ),
                enableColumnFilter: true,
            },
            {
                accessorKey: "localPlan",
                header: ({ column }) => (
                    <SortableHeader column={column}>Local Plan</SortableHeader>
                ),
                enableColumnFilter: true,
            },
            {
                accessorKey: "year",
                header: ({ column }) => (
                    <SortableHeader column={column}>Year</SortableHeader>
                ),
            },
            {
                accessorKey: "revision",
                header: ({ column }) => (
                    <SortableHeader column={column}>Revision</SortableHeader>
                ),
            },
            {
                accessorKey: "isRevised",
                header: ({ column }) => (
                    <SortableHeader column={column}>Revised</SortableHeader>
                ),
                cell: ({ getValue }) => (
                    <IsRevisedPresenter value={getValue<boolean>()} />
                ),
            },
            {
                accessorKey: "revisionDate",
                header: ({ column }) => (
                    <SortableHeader column={column}>
                        Revision Date
                    </SortableHeader>
                ),
                cell: ({ getValue }) => dateFormatter(getValue<string>()),
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

    return (
        <div className="mt-6 flex flex-col gap-4">
            <TableToolbar
                filterToggle={filterToggle}
                onFilterToggleChange={handleFilterToggleChange}
            />

            <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="bg-secondary p-2 font-semibold"
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
                title="Are you sure you want to delete this Agreement?"
                message={`This action cannot be undone. This will permanently delete the agreement ${agreementToDelete?.code} of year ${agreementToDelete?.year} revsion ${agreementToDelete?.revision}.`}
            />
            {isDeleting && <Deleting />}
        </div>
    )
}
