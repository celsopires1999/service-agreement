"use client"
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
import { getServicesBySystemIdType } from "@/lib/queries/service"
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
import { CircleCheckIcon, CircleXIcon, TableOfContents } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ActionsCell } from "./ActionsCell"

type Props = {
    data: getServicesBySystemIdType[]
}

export function SystemServicesTable({ data }: Props) {
    const router = useRouter()

    const searchParams = useSearchParams()

    const [total, setTotal] = useState({
        runSystem: "0.00",
        chgSystem: "0.00",
        amountSystem: "0.00",
    })

    useEffect(() => {
        const amount = totalSystemAmount()
        setTotal(amount)
    }, [data]) /* eslint-disable-line react-hooks/exhaustive-deps */

    const totalSystemAmount = () => {
        const amountSystem = data
            .reduce(
                (acc, item) =>
                    new Decimal(acc).add(toDecimal(item.systemAmount)),
                new Decimal(0),
            )
            .toString()

        const runSystem = data
            .reduce(
                (acc, item) =>
                    new Decimal(acc).add(toDecimal(item.systemRunAmount)),
                new Decimal(0),
            )
            .toString()

        const chgSystem = data
            .reduce(
                (acc, item) =>
                    new Decimal(acc).add(toDecimal(item.systemChgAmount)),
                new Decimal(0),
            )
            .toString()

        return {
            runSystem,
            chgSystem,
            amountSystem,
        }
    }

    const pageIndex = useMemo(() => {
        const page = searchParams.get("page")
        return page ? +page - 1 : 0
    }, [searchParams.get("page")]) // eslint-disable-line react-hooks/exhaustive-deps

    const columnHeadersArray: Array<keyof getServicesBySystemIdType> = [
        "agreementName",
        "serviceName",
        "systemAllocation",
        "systemRunAmount",
        "systemChgAmount",
        "systemAmount",
        "serviceAmount",
        "serviceCurrency",
        "serviceIsActive",
    ]

    const columnLabels: Partial<{
        [K in keyof getServicesBySystemIdType]: string
    }> = {
        agreementName: "Agreement",
        serviceName: "Service",
        systemAllocation: "Alloc (%)",
        systemRunAmount: "Run (USD)",
        systemChgAmount: "Change  (USD)",
        systemAmount: "Total (USD)",
        serviceAmount: "Service Amount",
        serviceCurrency: "Currency",
        serviceIsActive: "Allocated",
    }

    const columnWidths: Partial<{
        [K in keyof typeof columnLabels]: number
    }> = {
        serviceIsActive: 150,
        systemAllocation: 150,
    }

    const columnHelper = createColumnHelper<getServicesBySystemIdType>()

    const columns = [
        columnHelper.display({
            id: "actions",
            header: () => <TableOfContents />,
            cell: (ctx) => <ActionsCell {...ctx} />,
        }),
        ...columnHeadersArray.map((columnName) => {
            return columnHelper.accessor(
                (row) => {
                    // transformational
                    const value = row[columnName]
                    if (
                        columnName === "systemRunAmount" ||
                        columnName === "systemChgAmount" ||
                        columnName === "systemAmount" ||
                        columnName === "systemAllocation" ||
                        columnName === "serviceAmount"
                    ) {
                        return new Intl.NumberFormat("pt-BR", {
                            style: "decimal",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
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
                        // presentational
                        if (
                            columnName === "systemRunAmount" ||
                            columnName === "systemChgAmount" ||
                            columnName === "systemAmount" ||
                            columnName === "systemAllocation" ||
                            columnName === "serviceAmount"
                        ) {
                            return (
                                <div className="text-right">
                                    {info.renderValue()}
                                </div>
                            )
                        }

                        if (columnName === "serviceIsActive") {
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
                            <TableCell colSpan={4}>Grand Total</TableCell>
                            <TableCell className="text-right">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "decimal",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(+total.runSystem)}
                            </TableCell>
                            <TableCell className="text-right">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "decimal",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(+total.chgSystem)}
                            </TableCell>
                            <TableCell className="text-right">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "decimal",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(+total.amountSystem)}
                            </TableCell>
                            <TableCell colSpan={3}></TableCell>
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
        </div>
    )
}
