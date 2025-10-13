"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
    ColumnDef,
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
import { ActionsCell } from "./ActionsCell"

type SystemService = getServicesBySystemIdType

type SystemServicesTableProps = {
    readonly data: SystemService[]
}

type TotalAmounts = {
    runSystem: string
    chgSystem: string
    amountSystem: string
}

const calculateTotals = (data: SystemService[]): TotalAmounts => {
    const amountSystem = data
        .reduce(
            (acc, item) => new Decimal(acc).add(toDecimal(item.systemAmount)),
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
    return { runSystem, chgSystem, amountSystem }
}

const columnLabels: Record<
    keyof Pick<
        SystemService,
        | "agreementName"
        | "serviceName"
        | "systemAllocation"
        | "systemRunAmount"
        | "systemChgAmount"
        | "systemAmount"
        | "serviceAmount"
        | "serviceCurrency"
        | "serviceIsActive"
    >,
    string
> = {
    agreementName: "Agreement",
    serviceName: "Service",
    systemAllocation: "Alloc (%)",
    systemRunAmount: "Run (USD)",
    systemChgAmount: "Change (USD)",
    systemAmount: "Total (USD)",
    serviceAmount: "Service Amount",
    serviceCurrency: "Currency",
    serviceIsActive: "Allocated",
}

const columns: ColumnDef<SystemService>[] = [
    {
        id: "actions",
        header: () => <TableOfContents />,
        cell: (ctx) => <ActionsCell {...ctx} />, // ctx is correctly inferred by TanStack Table
        size: 48,
    },
    {
        accessorKey: "agreementName",
        header: () => columnLabels.agreementName,
        size: 200,
    },
    {
        accessorKey: "serviceName",
        header: () => columnLabels.serviceName,
        size: 200,
    },
    {
        accessorKey: "systemAllocation",
        header: () => columnLabels.systemAllocation,
        cell: ({ getValue }: { getValue: () => unknown }) => (
            <div className="text-right">
                {new Intl.NumberFormat("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(Number(getValue() || 0))}
            </div>
        ),
        size: 120,
    },
    {
        accessorKey: "systemRunAmount",
        header: () => columnLabels.systemRunAmount,
        cell: ({ getValue }: { getValue: () => unknown }) => (
            <div className="text-right">
                {new Intl.NumberFormat("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(Number(getValue() || 0))}
            </div>
        ),
        size: 120,
    },
    {
        accessorKey: "systemChgAmount",
        header: () => columnLabels.systemChgAmount,
        cell: ({ getValue }: { getValue: () => unknown }) => (
            <div className="text-right">
                {new Intl.NumberFormat("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(Number(getValue() || 0))}
            </div>
        ),
        size: 120,
    },
    {
        accessorKey: "systemAmount",
        header: () => columnLabels.systemAmount,
        cell: ({ getValue }: { getValue: () => unknown }) => (
            <div className="text-right">
                {new Intl.NumberFormat("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(Number(getValue() || 0))}
            </div>
        ),
        size: 120,
    },
    {
        accessorKey: "serviceAmount",
        header: () => columnLabels.serviceAmount,
        cell: ({ getValue }: { getValue: () => unknown }) => (
            <div className="text-right">
                {new Intl.NumberFormat("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(Number(getValue() || 0))}
            </div>
        ),
        size: 120,
    },
    {
        accessorKey: "serviceCurrency",
        header: () => columnLabels.serviceCurrency,
        size: 80,
    },
    {
        accessorKey: "serviceIsActive",
        header: () => columnLabels.serviceIsActive,
        cell: ({ getValue }: { getValue: () => unknown }) => (
            <div className="grid place-content-center">
                {getValue() ? (
                    <CircleCheckIcon
                        className="text-green-600"
                        data-testid="circle-check-icon-icon"
                    />
                ) : (
                    <CircleXIcon
                        className="opacity-25"
                        data-testid="circle-x-icon-icon"
                    />
                )}
            </div>
        ),
        size: 80,
    },
]

export function SystemServicesTable({ data }: SystemServicesTableProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [total, setTotal] = useState<TotalAmounts>(() =>
        calculateTotals(data),
    )

    useEffect(() => {
        setTotal(calculateTotals(data))
    }, [data])

    const pageIndex = useMemo(() => {
        const page = searchParams.get("page")
        return page ? Number(page) - 1 : 0
    }, [searchParams])

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
                                        className="bg-secondary font-semibold"
                                        style={{ width: header.getSize() }}
                                    >
                                        <div
                                            className={
                                                header.id === "actions"
                                                    ? "flex items-center justify-center"
                                                    : ""
                                            }
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
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(Number(total.runSystem))}
                            </TableCell>
                            <TableCell className="text-right">
                                {new Intl.NumberFormat("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(Number(total.chgSystem))}
                            </TableCell>
                            <TableCell className="text-right">
                                {new Intl.NumberFormat("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(Number(total.amountSystem))}
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
                        {`[${table.getFilteredRowModel().rows.length} ${
                            table.getFilteredRowModel().rows.length === 1
                                ? "result"
                                : "total results"
                        }]`}
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
        </div>
    )
}
