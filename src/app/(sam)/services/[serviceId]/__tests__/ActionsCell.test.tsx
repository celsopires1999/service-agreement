import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { getServiceSystemsSearchResultsType } from "@/lib/queries/serviceSystem"
import { ActionsCell } from "../ActionsCell"

const mockServiceSystem: getServiceSystemsSearchResultsType = {
    serviceId: "f1e2d3c4-b5a6-7890-1234-567890abcdef",
    systemId: "s1y2s3t4-e5m6-7890-1234-567890abcdef",
    name: "Test System",
    description: "A test system",
    allocation: "50.000000",
    amount: "1500.00",
    currency: "EUR",
}

const columnHelper = createColumnHelper<getServiceSystemsSearchResultsType>()

const MockTable = ({
    serviceSystem,
    isEditable,
    handleUpdateServiceSystem,
    handleDeleteServiceSystem,
}: {
    serviceSystem: getServiceSystemsSearchResultsType
    isEditable: boolean
    handleUpdateServiceSystem: jest.Mock
    handleDeleteServiceSystem: jest.Mock
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
                    isEditable={isEditable}
                    handleUpdateServiceSystem={handleUpdateServiceSystem}
                    handleDeleteServiceSystem={handleDeleteServiceSystem}
                />
            ),
        }),
    ]

    const table = useReactTable({
        data: [serviceSystem],
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

describe("ActionsCell for Service Systems", () => {
    let user: ReturnType<typeof userEvent.setup>
    let mockHandleUpdateServiceSystem: jest.Mock
    let mockHandleDeleteServiceSystem: jest.Mock

    beforeEach(() => {
        user = userEvent.setup()
        mockHandleUpdateServiceSystem = jest.fn()
        mockHandleDeleteServiceSystem = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should render the menu button", () => {
        render(
            <MockTable
                serviceSystem={mockServiceSystem}
                isEditable={true}
                handleUpdateServiceSystem={mockHandleUpdateServiceSystem}
                handleDeleteServiceSystem={mockHandleDeleteServiceSystem}
            />,
        )

        expect(
            screen.getByRole("button", { name: /open menu/i }),
        ).toBeInTheDocument()
    })

    it("should show correct menu items when editable", async () => {
        render(
            <MockTable
                serviceSystem={mockServiceSystem}
                isEditable={true}
                handleUpdateServiceSystem={mockHandleUpdateServiceSystem}
                handleDeleteServiceSystem={mockHandleDeleteServiceSystem}
            />,
        )

        await user.click(screen.getByRole("button", { name: /open menu/i }))

        // Allocation actions
        expect(screen.getByText("Allocation")).toBeInTheDocument()
        const editAllocationButton = screen.getAllByRole("menuitem", {
            name: "Edit",
        })[0]
        expect(editAllocationButton).toBeInTheDocument()
        await user.click(editAllocationButton)
        expect(mockHandleUpdateServiceSystem).toHaveBeenCalledWith(
            mockServiceSystem.systemId,
            mockServiceSystem.allocation,
        )

        // Re-open menu
        await user.click(screen.getByRole("button", { name: /open menu/i }))
        const deleteButton = screen.getByRole("menuitem", { name: "Delete" })
        expect(deleteButton).toBeInTheDocument()
        await user.click(deleteButton)
        expect(mockHandleDeleteServiceSystem).toHaveBeenCalledWith(
            mockServiceSystem.serviceId,
            mockServiceSystem.systemId,
        )
    })

    it("should not show Edit and Delete for Allocation when not editable", async () => {
        render(
            <MockTable
                serviceSystem={mockServiceSystem}
                isEditable={false}
                handleUpdateServiceSystem={mockHandleUpdateServiceSystem}
                handleDeleteServiceSystem={mockHandleDeleteServiceSystem}
            />,
        )

        await user.click(screen.getByRole("button", { name: /open menu/i }))

        const menuItems = screen.queryAllByRole("menuitem")
        const editButton = menuItems.find(
            (item) =>
                item.textContent === "Edit" &&
                item.tagName.toLowerCase() !== "a",
        )
        const deleteButton = menuItems.find(
            (item) =>
                item.textContent === "Delete" &&
                item.tagName.toLowerCase() !== "a",
        )

        expect(editButton).toBeUndefined()
        expect(deleteButton).toBeUndefined()
    })
})
