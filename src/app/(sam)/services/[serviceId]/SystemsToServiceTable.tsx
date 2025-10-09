"use client"
import { deleteServiceSystemAction } from "@/actions/deleteServiceSystemAction"
import Deleting from "@/app/components/Deleting"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { getServiceSystemsSearchResultsType } from "@/lib/queries/serviceSystem"
import { toDecimal } from "@/lib/utils"
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
import Decimal from "decimal.js"
import { TableOfContents } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ActionsCell } from "./ActionsCell"

type Props = {
    data: getServiceSystemsSearchResultsType[]
    handleUpdateServiceSystem(systemId: string, allocation: string): void
    isEditable?: boolean
}

export function SystemsToServiceTable({
    data,
    handleUpdateServiceSystem,
    isEditable = true,
}: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const {
        executeAsync: executeDelete,
        isPending: isDeleting,
        reset: resetDeleteAction,
    } = useAction(deleteServiceSystemAction, {
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

    const handleDeleteServiceSystem = async (
        serviceId: string,
        systemId: string,
    ) => {
        resetDeleteAction()
        try {
            await executeDelete({ serviceId, systemId })
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

    const [total, setTotal] = useState({ allocation: "0.00", amount: "0.00" })

    useEffect(() => {
        const { allocation, amount } = totalAllocationAndAmount()
        setTotal({ allocation, amount })
    }, [data]) /* eslint-disable-line react-hooks/exhaustive-deps */

    const totalAllocationAndAmount = () => {
        const allocation = data
            .reduce(
                (acc, item) => new Decimal(acc).add(toDecimal(item.allocation)),
                new Decimal(0),
            )
            .toString()
        const amount = data
            .reduce(
                (acc, item) => new Decimal(acc).add(toDecimal(item.amount)),
                new Decimal(0),
            )
            .toString()
        return { allocation, amount }
    }

    const pageIndex = useMemo(() => {
        const page = searchParams.get("page")
        return page ? +page - 1 : 0
    }, [searchParams.get("page")]) // eslint-disable-line react-hooks/exhaustive-deps

    const columnHeadersArray: Array<keyof getServiceSystemsSearchResultsType> =
        ["name", "allocation", "amount", "currency", "description"]

    const columnLabels: Partial<{
        [K in keyof getServiceSystemsSearchResultsType]: string
    }> = {
        name: "System Name",
        allocation: "Alloc (%)",
        amount: "Amount",
        currency: "Currency",
        description: "Description",
    }

    const columnWidths: Partial<{
        [K in keyof typeof columnLabels]: number
    }> = {
        amount: 150,
        currency: 150,
        allocation: 150,
    }

    const columnHelper =
        createColumnHelper<getServiceSystemsSearchResultsType>()

    const columns = [
        columnHelper.display({
            id: "actions",
            header: () => <TableOfContents />, // já existente
            cell: (ctx) => (
                <ActionsCell
                    {...ctx}
                    isEditable={isEditable}
                    handleUpdateServiceSystem={handleUpdateServiceSystem}
                    handleDeleteServiceSystem={handleDeleteServiceSystem}
                />
            ),
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
                    if (columnName === "allocation") {
                        return new Intl.NumberFormat("pt-BR", {
                            style: "decimal",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                        }).format(+value)
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
                        if (
                            columnName === "amount" ||
                            columnName === "allocation"
                        ) {
                            return (
                                <div
                                    className="cursor-pointer text-right"
                                    onClick={() =>
                                        handleUpdateServiceSystem(
                                            info.row.original.systemId,
                                            info.row.original.allocation,
                                        )
                                    }
                                >
                                    {info.renderValue()}
                                </div>
                            )
                        }

                        return (
                            <div
                                className="cursor-pointer text-left"
                                onClick={() =>
                                    handleUpdateServiceSystem(
                                        info.row.original.systemId,
                                        info.row.original.allocation,
                                    )
                                }
                            >
                                {info.renderValue()}
                            </div>
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
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={2}>Total</TableCell>
                            <TableCell className="text-right">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "decimal",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 6,
                                }).format(+total.allocation)}
                            </TableCell>
                            <TableCell className="text-right">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "decimal",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(+total.amount)}
                            </TableCell>
                            <TableCell>{data[0]?.currency}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
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
            {isDeleting && <Deleting />}
        </div>
    )
}
