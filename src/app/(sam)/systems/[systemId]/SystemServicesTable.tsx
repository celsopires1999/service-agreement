"use client"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
    CellContext,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table"
import { MoreHorizontal, TableOfContents } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"


type Props = {
    data: getServicesBySystemIdType[]
}

export function SystemServicesTable({ data }: Props) {
    const router = useRouter()

    const searchParams = useSearchParams()

    const pageIndex = useMemo(() => {
        const page = searchParams.get("page")
        return page ? +page - 1 : 0
    }, [searchParams.get("page")]) // eslint-disable-line react-hooks/exhaustive-deps


    const columnHeadersArray: Array<keyof getServicesBySystemIdType> = [
        "year",
        "agreementName",
        "serviceName",
        "systemAllocation",
        "systemAmount",
        "serviceAmount",
        "serviceCurrency",
    ]

    const columnLabels: Partial<{ [K in keyof getServicesBySystemIdType]: string }> = {
        year: "Year",
        agreementName: "Agreement",
        serviceName: "Service",
        systemAllocation: "Alloc (%)",
        systemAmount: "Amount (USD)",
        serviceAmount: "Service Amount",
        serviceCurrency: "Currency",
    }

    const columnWidths: Partial<{
        [K in keyof typeof columnLabels]: number
    }> = {
        year: 150,
        systemAllocation: 150,
    }

    const columnHelper = createColumnHelper<getServicesBySystemIdType>()

    const ActionsCell = ({
        row,
    }: CellContext<getServicesBySystemIdType, unknown>) => {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open Menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem>
                        <Link
                            href={`/services/form?serviceId=${row.original.serviceId}`}
                            className="w-full"
                            prefetch={false}
                        >
                            Service
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Link
                            href={`/agreements/form?agreementId=${row.original.agreementId}`}
                            className="w-full"
                            prefetch={false}
                        >
                            Agreement
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Link
                            href={`/services/${row.original.serviceId}`}
                            className="w-full"
                            prefetch={false}
                        >
                            Service Systems
                        </Link>
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

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
                    if (columnName === "systemAmount" || columnName === "systemAllocation" || columnName === "serviceAmount") {
                        return new Intl.NumberFormat("pt-BR", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(+value)
                    }
                    return value
                },
                {
                    id: columnName,
                    size:
                        columnWidths[columnName as keyof typeof columnWidths] ??
                        undefined,
                    header: () => (columnLabels[columnName as keyof typeof columnLabels]),
                    cell: (info) => {
                        if (columnName === "systemAmount" || columnName === "systemAllocation" || columnName === "serviceAmount") {
                            return (
                                <div className="text-right">
                                    {info.renderValue()}
                                </div>
                            )
                        }
                        return (
                            info.renderValue()
                        )
                    }
                },

            )
        })]

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
                            <TableCell colSpan={5}>Total</TableCell>
                            <TableCell className="text-right">
                                {new Intl.NumberFormat("pt-BR", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)}
                            </TableCell>
                            <TableCell colSpan={2}></TableCell>
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