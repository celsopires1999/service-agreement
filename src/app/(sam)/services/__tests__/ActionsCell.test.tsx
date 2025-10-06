import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { getServiceSearchResultsType } from "@/lib/queries/service"
import { ActionsCell } from "../ActionsCell"

const mockService: getServiceSearchResultsType = {
    serviceId: "s1e2d3c4-b5a6-7890-1234-567890abcdef",
    agreementId: "a1e2d3c4-b5a6-7890-1234-567890abcdef",
    name: "Test Service",
    amount: "1000",
    currency: "USD",
    responsibleEmail: "responsible@example.com",
    validatorEmail: "validator@example.com",
    status: "created",
    isRevised: false,
    agreementCode: "AG-001",
    localPlan: "LP-2024",
    year: 2024,
    revisionDate: "2024-05-28",
    agreementName: "Test Agreement",
    revision: 1,
}

const mockServiceRevised: getServiceSearchResultsType = {
    ...mockService,
    isRevised: true,
}

const columnHelper = createColumnHelper<getServiceSearchResultsType>()

const MockTable = ({
    service,
    handleDeleteService,
}: {
    service: getServiceSearchResultsType
    handleDeleteService: jest.Mock
}) => {
    const columns = [
        columnHelper.accessor("name", {
            cell: (info) => info.getValue(),
        }),
        columnHelper.display({
            id: "actions",
            cell: (props) => (
                <ActionsCell
                    {...props}
                    handleDeleteService={handleDeleteService}
                />
            ),
        }),
    ]

    const table = useReactTable({
        data: [service],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <table>
            <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

describe("ActionsCell for Services", () => {
    let user: ReturnType<typeof userEvent.setup>
    let mockHandleDeleteService: jest.Mock

    beforeEach(() => {
        user = userEvent.setup()
        mockHandleDeleteService = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should render the menu button", () => {
        render(
            <MockTable
                service={mockService}
                handleDeleteService={mockHandleDeleteService}
            />,
        )

        expect(
            screen.getByRole("button", { name: /open menu/i }),
        ).toBeInTheDocument()
    })

    it("should show correct menu items for a non-revised service", async () => {
        render(
            <MockTable
                service={mockService}
                handleDeleteService={mockHandleDeleteService}
            />,
        )

        await user.click(screen.getByRole("button", { name: /open menu/i }))

        // Check Agreement sub-menu
        await user.click(screen.getByText("Agreement"))
        const editAgreementLink = await screen.findByRole("menuitem", {
            name: "Edit",
        })
        expect(editAgreementLink.closest("a")).toHaveAttribute(
            "href",
            `/agreements/form?agreementId=${mockService.agreementId}`,
        )

        // Check Service sub-menu
        await user.click(screen.getByText("Service"))
        const addServiceLink = await screen.findByRole("menuitem", {
            name: "Add",
        })
        expect(addServiceLink.closest("a")).toHaveAttribute(
            "href",
            `/services/form?agreementId=${mockService.agreementId}`,
        )

        const editServiceLink = screen.getByRole("menuitem", { name: "Edit" })
        expect(editServiceLink.closest("a")).toHaveAttribute(
            "href",
            `/services/form?serviceId=${mockService.serviceId}`,
        )

        const deleteButton = screen.getByRole("menuitem", { name: "Delete" })
        expect(deleteButton).toBeInTheDocument()
        await waitFor(() => {
            deleteButton.focus()
        })

        await user.keyboard("{enter}")

        expect(mockHandleDeleteService).toHaveBeenCalledWith(mockService)
    })

    it("should show correct menu items for a revised service", async () => {
        render(
            <MockTable
                service={mockServiceRevised}
                handleDeleteService={mockHandleDeleteService}
            />,
        )

        await user.click(screen.getByRole("button", { name: /open menu/i }))
        await user.click(screen.getByText("Service"))

        expect(
            screen.queryByRole("menuitem", { name: "Add" }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole("menuitem", { name: "Delete" }),
        ).not.toBeInTheDocument()

        const viewServiceLink = screen.getByRole("menuitem", { name: "View" })
        expect(viewServiceLink.closest("a")).toHaveAttribute(
            "href",
            `/services/form?serviceId=${mockServiceRevised.serviceId}`,
        )
    })
})
