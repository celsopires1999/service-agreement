"use client"
import { deleteUserAction } from "@/actions/deleteUserAction"
import { AlertConfirmation } from "@/app/components/AlertConfirmation"
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
import type { getUserType } from "@/lib/queries/user"
import type { Column, ColumnDef } from "@tanstack/react-table"
import {
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { memo, useCallback, useMemo, useState } from "react"

import { ActionsCell } from "./ActionsCell"

type User = getUserType

type UserTableProps = {
    readonly data: User[]
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
            <h2 className="text-2xl font-bold">Users List</h2>
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
        {column.getIsSorted() === "asc" && <span className="ml-2">▲</span>}
        {column.getIsSorted() === "desc" && <span className="ml-2">▼</span>}
    </Button>
)

export function UserTable({ data }: UserTableProps) {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

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
    } = useAction(deleteUserAction, {
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

    const handleDeleteRequest = useCallback((user: User) => {
        setUserToDelete(user)
        setShowDeleteConfirmation(true)
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        if (userToDelete) {
            resetDeleteAction()
            try {
                await executeDelete({ userId: userToDelete.userId })
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
        setUserToDelete(null)
    }, [userToDelete, executeDelete, resetDeleteAction])

    const handleFilterToggleChange = useCallback(
        (checked: boolean) => {
            if (!checked) {
                setColumnFilters([])
            }
            handleFilterToggle(checked)
        },
        [handleFilterToggle, setColumnFilters],
    )

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                id: "actions",
                header: () => (
                    <IconButtonWithTooltip text="New User" href="/users/form" />
                ),
                cell: (ctx) => (
                    <ActionsCell
                        {...ctx}
                        handleDeleteUser={handleDeleteRequest}
                    />
                ),
                size: 48,
            },
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <SortableHeader column={column}>User</SortableHeader>
                ),
                cell: ({ row, getValue }) => (
                    <Link
                        href={`/users/form?userId=${row.original.userId}`}
                        prefetch={false}
                    >
                        {getValue<string>()}
                    </Link>
                ),
                enableColumnFilter: true,
                size: 500,
            },
            {
                accessorKey: "email",
                header: ({ column }) => (
                    <SortableHeader column={column}>Email</SortableHeader>
                ),
                enableColumnFilter: true,
                size: 500,
            },
            {
                accessorKey: "role",
                header: ({ column }) => (
                    <SortableHeader column={column}>Role</SortableHeader>
                ),
                enableColumnFilter: true,
                size: 300,
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
                        {`[${table.getFilteredRowModel().rows.length} ${table.getFilteredRowModel().rows.length !== 1 ? "total results" : "result"}]`}
                    </p>
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
            <AlertConfirmation
                open={showDeleteConfirmation}
                setOpen={setShowDeleteConfirmation}
                confirmationAction={handleConfirmDelete}
                title="Are you sure you want to delete this User?"
                message={`This action cannot be undone. This will permanently delete the user ${userToDelete?.name}.`}
            />
            {isDeleting && <Deleting />}
        </div>
    )
}
