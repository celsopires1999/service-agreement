"use client"
import { deleteSystemAction } from "@/actions/deleteSystemAction"
import { AlertConfirmation } from "@/app/components/AlertConfirmation"
import Deleting from "@/app/components/Deleting"
import { Button } from "@/components/ui/button"
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
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { TableOfContents } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { ActionsCell } from "./ActionsCell"

type Props = {
    data: getSystemType[]
}

export function SystemTable({ data }: Props) {
    const router = useRouter()

    const searchParams = useSearchParams()

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [systemToDelete, setSystemToDelete] = useState<getSystemType | null>(
        null,
    )

    const handleDeleteSystem = (system: getSystemType) => {
        setSystemToDelete(system)
        setShowDeleteConfirmation(true)
    }

    const {
        executeAsync: executeDelete,
        isPending: isDeleting,
        reset: resetDeleteAction,
    } = useAction(deleteSystemAction, {
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

    const confirmDeleteSystem = async () => {
        if (systemToDelete) {
            resetDeleteAction()
            try {
                await executeDelete({
                    systemId: systemToDelete.systemId,
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
        setSystemToDelete(null)
    }

    const pageIndex = useMemo(() => {
        const page = searchParams.get("page")
        return page ? +page - 1 : 0
    }, [searchParams.get("page")]) // eslint-disable-line react-hooks/exhaustive-deps

    const columnHeadersArray: Array<keyof getSystemType> = [
        "name",
        "applicationId",
        "description",
    ]

    const columnLabels: Partial<{ [K in keyof getSystemType]: string }> = {
        name: "System",
        applicationId: "Application ID",
        description: "Description",
    }

    const columnWidths: Partial<{
        [K in keyof typeof columnLabels]: number
    }> = {
        applicationId: 150,
    }

    const columnHelper = createColumnHelper<getSystemType>()

    const columns = [
        columnHelper.display({
            id: "actions",
            header: () => <TableOfContents />,
            cell: (ctx) => (
                <ActionsCell {...ctx} handleDeleteSystem={handleDeleteSystem} />
            ),
        }),
        ...columnHeadersArray.map((columnName) => {
            return columnHelper.accessor(
                (row) => {
                    // transformational
                    const value = row[columnName]
                    // for now there is no need for transformation
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
                        return (
                            <Link
                                href={`/systems/form?systemId=${info.row.original.systemId}`}
                                prefetch={false}
                            >
                                <div>{info.renderValue()?.toString()}</div>
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
            <h2 className="text-2xl font-bold">Systems List</h2>
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
                confirmationAction={confirmDeleteSystem}
                title="Are you sure you want to delete this System?"
                message={`This action cannot be undone. This will permanently delete the system ${systemToDelete?.name}.`}
            />
            {isDeleting && <Deleting />}
        </div>
    )
}
