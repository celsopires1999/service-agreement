"use client"
// import { deleteAgreementAction } from "@/actions/deleteAgreementAction"
import { AlertConfirmation } from "@/components/AlertConfirmation"
import Deleting from "@/components/Deleting"
import { EditableDecimalCell } from "@/components/inputs/EditableDecimalCell"
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
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getAgreementType } from "@/lib/queries/agreement"
import { getServicesByAgreementIdType } from "@/lib/queries/service"
// import { toast } from "@/hooks/use-toast"

import { selectAgreementSchemaType } from "@/zod-schemas/agreement"
import {
    CellContext,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    CircleCheckIcon,
    CircleXIcon,
    MoreHorizontal,
    TableOfContents,
} from "lucide-react"
// import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

type Props = {
    agreement: getAgreementType
    services: getServicesByAgreementIdType[]
}

export function AgreementAmountChangeTable({
    agreement,
    services: input,
}: Props) {
    const [data, setData] = useState<getServicesByAgreementIdType[]>(input)

    const router = useRouter()

    const searchParams = useSearchParams()

    // const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    // const [agreementToDelete, setAgreementToDelete] =
    //     useState<getServicesByAgreementIdType | null>(null)

    // const handleDeleteAgreement = (
    //     agreement: getServicesByAgreementIdType,
    // ) => {
    //     setAgreementToDelete(agreement)
    //     setShowDeleteConfirmation(true)
    // }

    // const {
    //     executeAsync: executeDelete,
    //     isPending: isDeleting,
    //     reset: resetDeleteAction,
    // } = useAction(deleteAgreementAction, {
    //     onSuccess({ data }) {
    //         if (data?.message) {
    //             toast({
    //                 variant: "default",
    //                 title: "Success! 🎉",
    //                 description: data.message,
    //             })
    //         }
    //     },
    //     onError({ error }) {
    //         toast({
    //             variant: "destructive",
    //             title: "Error",
    //             description: error.serverError,
    //         })
    //     },
    // })

    // const confirmDeleteAgreement = async () => {
    //     if (agreementToDelete) {
    //         resetDeleteAction()
    //         try {
    //             await executeDelete({
    //                 agreementId: agreementToDelete.agreementId,
    //             })
    //         } catch (error) {
    //             if (error instanceof Error) {
    //                 toast({
    //                     variant: "destructive",
    //                     title: "Error",
    //                     description: `Action error: ${error.message}`,
    //                 })
    //             }
    //         }
    //     }
    //     setShowDeleteConfirmation(false)
    //     setAgreementToDelete(null)
    // }

    const pageIndex = useMemo(() => {
        const page = searchParams.get("page")
        return page ? +page - 1 : 0
    }, [searchParams.get("page")]) // eslint-disable-line react-hooks/exhaustive-deps

    const columnHeadersArray: Array<keyof getServicesByAgreementIdType> = [
        "name",
        "amount",
        "currency",
    ]

    const columnProps: Partial<{
        [K in keyof getServicesByAgreementIdType]: {
            label: string
            size?: number
            className?: string
        }
    }> = {
        name: { label: "Name" },
        amount: { label: "Amount", className: "text-right w-36" },
        currency: { label: "Currency", className: "w-24" },
    }

    // const columnLabels: Partial<{
    //     [K in keyof getServicesByAgreementIdType]: string
    // }> = {
    //     name: "Name",
    //     amount: "Amount",
    //     currency: "Currency",
    // }

    // const columnWidths: Partial<{
    //     [K in keyof typeof columnLabels]: number
    // }> = {}

    // const columnStyle: Partial<{
    //     [K in keyof typeof columnLabels]: string
    // }> = {
    //     amount: "text-right w-36",
    // }

    const columnHelper = createColumnHelper<getServicesByAgreementIdType>()

    const ActionsCell = ({
        row,
    }: CellContext<getServicesByAgreementIdType, unknown>) => {
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
                    {/* <DropdownMenuItem>
                        <Link
                            href={`/agreements/form?agreementId=${row.original.agreementId}`}
                            className="w-full"
                            prefetch={false}
                        >
                            Edit Agreement
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link
                            href={`/services?searchText=${row.original.code}`}
                            className="w-full"
                            prefetch={false}
                        >
                            List Services
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Link
                            href={`/services/form?agreementId=${row.original.agreementId}`}
                            className="w-full"
                            prefetch={false}
                        >
                            Add Service
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Link
                            href={`/agreements/${row.original.agreementId}/new-revision`}
                            className="w-full"
                            prefetch={false}
                        >
                            New Revision
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => handleDeleteAgreement(row.original)}
                    >
                        Delete Agreement
                    </DropdownMenuItem> */}
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
                    // if (
                    //     columnName === "revisionDate" &&
                    //     typeof value === "string"
                    // ) {
                    //     return value
                    //         ? new Intl.DateTimeFormat("pt-BR", {
                    //               year: "numeric",
                    //               month: "2-digit",
                    //               day: "2-digit",
                    //           }).format(
                    //               new Date(
                    //                   +value.substring(0, 4),
                    //                   +value.substring(5, 7) - 1,
                    //                   +value.substring(8, 10),
                    //               ),
                    //           )
                    //         : ""
                    // }
                    return value
                },
                {
                    id: columnName,
                    size:
                        columnProps[columnName as keyof typeof columnProps]
                            ?.size ?? undefined,
                    header: () =>
                        columnProps[columnName as keyof typeof columnProps]
                            ?.label ?? "",
                    cell: (info) => {
                        // presentational
                        if (columnName === "amount") {
                            return (
                                <EditableDecimalCell<getServicesByAgreementIdType>
                                    info={info}
                                    type="number"
                                    className="text-right"
                                />
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
        meta: {
            updateData: (
                rowIndex: number,
                columnId: keyof getServicesByAgreementIdType,
                value: string,
            ) => {
                setData((prev) =>
                    prev.map((row, index) =>
                        index === rowIndex
                            ? {
                                  ...row,
                                  [columnId]: value,
                              }
                            : row,
                    ),
                )
            },
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
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
            <h2 className="text-2xl font-bold">Agreements List</h2>
            <div className="overflow-hidden rounded-lg border border-border">
                <Table className="border">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        // className={`bg-secondary font-semibold ${header.id === "actions" ? "w-12" : ""} ${header.id === "amount" ? "w-36 text-right" : ""}`}
                                        className={`bg-secondary font-semibold ${header.id === "actions" ? "w-12" : null} ${columnProps[header.id as keyof typeof columnProps]?.className ?? null}`}
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
            {/* <AlertConfirmation
                open={showDeleteConfirmation}
                setOpen={setShowDeleteConfirmation}
                confirmationAction={confirmDeleteAgreement}
                title="Are you sure you want to delete this Agreement?"
                message={`This action cannot be undone. This will permanently delete the agreement ${agreementToDelete?.code} of year ${agreementToDelete?.year} revsion ${agreementToDelete?.revision}.`}
            />
            {isDeleting && <Deleting />} */}
        </div>
    )
}
