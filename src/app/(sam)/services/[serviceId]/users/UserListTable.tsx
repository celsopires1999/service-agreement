"use client"

import { Filter } from "@/components/react-table/Filter"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getUserListItemsByServiceIdType } from "@/lib/queries/userList"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, TableOfContents } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ActionsCell } from "./ActionsCell"

type User = getUserListItemsByServiceIdType

type UserListTableProps = {
    readonly data: User[]
}

import type { Column } from "@tanstack/react-table"

const SortableHeader = ({
    children,
    column,
}: {
    children: React.ReactNode
    column: Column<User, unknown>
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

export function UserListTable({ data }: UserListTableProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const pageIndex = useMemo(() => {
        const page = searchParams.get("page")
        return page ? Number(page) - 1 : 0
    }, [searchParams])

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([
        { id: "name", desc: false },
    ])

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                id: "actions",
                header: () => <TableOfContents />,
                cell: (ctx) => <ActionsCell {...ctx} />, // ActionsCell must be typed
                size: 48,
            },
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <SortableHeader column={column}>Name</SortableHeader>
                ),
                enableColumnFilter: true,
                size: 255,
                cell: ({ getValue }) => {
                    const value = getValue<string>()
                    return <span>{value}</span>
                },
            },
            {
                accessorKey: "email",
                header: ({ column }) => (
                    <SortableHeader column={column}>Email</SortableHeader>
                ),
                enableColumnFilter: true,
                size: 255,
            },
            {
                accessorKey: "corpUserId",
                header: ({ column }) => (
                    <SortableHeader column={column}>
                        Corp User ID
                    </SortableHeader>
                ),
                enableColumnFilter: true,
                size: 150,
            },
            {
                accessorKey: "area",
                header: ({ column }) => (
                    <SortableHeader column={column}>Area</SortableHeader>
                ),
                enableColumnFilter: true,
                size: 150,
            },
            {
                accessorKey: "costCenter",
                header: ({ column }) => (
                    <SortableHeader column={column}>Cost Center</SortableHeader>
                ),
                enableColumnFilter: true,
                size: 150,
            },
        ],
        [],
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
            const index = direction === "previous" ? -1 : 1
            const newIndex = table.getState().pagination.pageIndex + index
            table.setPageIndex(newIndex)
            const params = new URLSearchParams(searchParams.toString())
            params.set("page", (newIndex + 1).toString())
            router.replace(`?${params.toString()}`, { scroll: false })
        },
        [router, searchParams, table],
    )

    useEffect(() => {
        const currentPageIndex = table.getState().pagination.pageIndex
        const pageCount = table.getPageCount()
        if (pageCount <= currentPageIndex && currentPageIndex > 0) {
            const params = new URLSearchParams(searchParams.toString())
            params.set("page", "1")
            router.replace(`?${params.toString()}`, { scroll: false })
        }
        // Only run when columnFilters change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [table.getState().columnFilters])

    return (
        <div className="mt-6 flex flex-col gap-4">
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
                                        {header.column.getCanFilter() && (
                                            <div className="grid place-items-start">
                                                <Filter
                                                    column={header.column}
                                                    filteredRows={table
                                                        .getFilteredRowModel()
                                                        .rows.map((row) =>
                                                            row.getValue(
                                                                header.column
                                                                    .id,
                                                            ),
                                                        )}
                                                />
                                            </div>
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
                        <Button
                            variant="outline"
                            onClick={() => table.resetColumnFilters()}
                        >
                            Reset Filters
                        </Button>
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
        </div>
    )
}
