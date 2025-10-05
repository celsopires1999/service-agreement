import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { getServiceSearchResultsType } from "@/lib/queries/service"
import { ActionsCell } from "../ActionsCell"

const mockService: getServiceSearchResultsType = {
    serviceId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    agreementId: "f1e2d3c4-b5a6-7890-1234-567890abcdef",
    name: "Test Service",
    amount: "1500.00",
    currency: "USD",
    responsibleEmail: "test@example.com",
    validatorEmail: "validator@example.com",
    status: "created",
    isRevised: false,
    agreementCode: "AG-001",
    agreementName: "Test Agreement",
    year: 2024,
    revision: 1,
    revisionDate: "2024-01-01",
    localPlan: "LP-2024",
}

const mockRevisedService: getServiceSearchResultsType = {
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

describe("ActionsCell", () => {
    let user: ReturnType<typeof userEvent.setup>
    let mockHandleDeleteService: jest.Mock

    beforeEach(() => {
        user = userEvent.setup()
        mockHandleDeleteService = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should render edit and delete options", () => {
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

        // Service submenu
        await user.hover(screen.getByText("Service"))
        const addServiceLink = await waitFor(() => {
            return screen.findByRole("menuitem", {
                name: "Add",
            })
        })

        expect(addServiceLink).toBeInTheDocument()
        expect(addServiceLink.closest("a")).toHaveAttribute(
            "href",
            `/services/form?agreementId=${mockService.agreementId}`,
        )

        const editServiceLink = screen.getByRole("menuitem", { name: "Edit" })
        expect(editServiceLink).toBeInTheDocument()
        expect(editServiceLink.closest("a")).toHaveAttribute(
            "href",
            `/services/form?serviceId=${mockService.serviceId}`,
        )

        const deleteServiceButton = screen.getByRole("menuitem", {
            name: "Delete",
        })
        expect(deleteServiceButton).toBeInTheDocument()

        await waitFor(() => {
            deleteServiceButton.focus()
        })

        await user.keyboard("{enter}")

        expect(mockHandleDeleteService).toHaveBeenCalledWith(mockService)

        // Close and re-open menu to interact with the next item to avoid race conditions
        await user.keyboard("{escape}")
        await user.click(screen.getByRole("button", { name: /open menu/i }))

        // User List submenu
        await user.hover(screen.getByText("User List"))
        const editUserListLink = await screen.findByRole("menuitem", {
            name: "Edit",
        })
        expect(editUserListLink).toBeInTheDocument()
        expect(editUserListLink.closest("a")).toHaveAttribute(
            "href",
            `/services/${mockService.serviceId}/users`,
        )

        // Close and re-open menu to interact with the next item
        await user.keyboard("{escape}")
        await user.click(screen.getByRole("button", { name: /open menu/i }))

        // Systems submenu
        await user.hover(screen.getByText("Systems"))
        const allocationLink = await screen.findByRole("menuitem", {
            name: "Allocation",
        })
        expect(allocationLink).toBeInTheDocument()
        expect(allocationLink.closest("a")).toHaveAttribute(
            "href",
            `/services/${mockService.serviceId}`,
        )
    })

    it("should show correct menu items for a revised service", async () => {
        render(
            <MockTable
                service={mockRevisedService}
                handleDeleteService={mockHandleDeleteService}
            />,
        )

        await user.click(screen.getByRole("button", { name: /open menu/i }))

        // Service submenu
        await user.hover(screen.getByText("Service"))
        await waitFor(() => {
            expect(
                screen.queryByRole("menuitem", { name: "Add" }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole("menuitem", { name: "Delete" }),
            ).not.toBeInTheDocument()
        })

        const viewServiceLink = await screen.findByRole("menuitem", {
            name: "View",
        })
        expect(viewServiceLink).toBeInTheDocument()
        expect(viewServiceLink.closest("a")).toHaveAttribute(
            "href",
            `/services/form?serviceId=${mockRevisedService.serviceId}`,
        )

        // Close and re-open menu
        await user.keyboard("{escape}")
        await user.click(screen.getByRole("button", { name: /open menu/i }))

        // User List submenu
        await user.hover(screen.getByText("User List"))
        const viewUserListLink = await screen.findByRole("menuitem", {
            name: "View",
        })
        expect(viewUserListLink).toBeInTheDocument()
        expect(viewUserListLink.closest("a")).toHaveAttribute(
            "href",
            `/services/${mockRevisedService.serviceId}/users`,
        )

        // Close and re-open menu
        await user.keyboard("{escape}")
        await user.click(screen.getByRole("button", { name: /open menu/i }))

        // Systems submenu
        await user.hover(screen.getByText("Systems"))
        const allocationLink = await screen.findByRole("menuitem", {
            name: "Allocation",
        })
        expect(allocationLink).toBeInTheDocument()
        expect(allocationLink.closest("a")).toHaveAttribute(
            "href",
            `/services/${mockRevisedService.serviceId}`,
        )
    })
})
