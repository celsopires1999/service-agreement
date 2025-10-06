import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { getPlansType } from "@/lib/queries/plan"
import { ActionsCell } from "../ActionsCell"

const mockPlan: getPlansType = {
    planId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    code: "PLAN-001",
    description: "Test Plan",
    euro: "100.00",
    planDate: "2024-10-26",
}

const columnHelper = createColumnHelper<getPlansType>()

const MockTable = ({
    plan,
    handleUpdatePlan,
    handleDeletePlan,
}: {
    plan: getPlansType
    handleUpdatePlan: jest.Mock
    handleDeletePlan: jest.Mock
}) => {
    const columns = [
        columnHelper.accessor("description", {
            cell: (info) => info.getValue(),
        }),
        columnHelper.display({
            id: "actions",
            cell: (props) => (
                <ActionsCell
                    {...props}
                    handleUpdatePlan={handleUpdatePlan}
                    handleDeletePlan={handleDeletePlan}
                />
            ),
        }),
    ]

    const table = useReactTable({
        data: [plan],
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

describe("ActionsCell for Plans", () => {
    let user: ReturnType<typeof userEvent.setup>
    let mockHandleUpdatePlan: jest.Mock
    let mockHandleDeletePlan: jest.Mock

    beforeEach(() => {
        user = userEvent.setup()
        mockHandleUpdatePlan = jest.fn()
        mockHandleDeletePlan = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should render the menu button and handle edit and delete actions", async () => {
        render(
            <MockTable
                plan={mockPlan}
                handleUpdatePlan={mockHandleUpdatePlan}
                handleDeletePlan={mockHandleDeletePlan}
            />,
        )

        const menuButton = screen.getByRole("button", { name: /open menu/i })
        expect(menuButton).toBeInTheDocument()

        await user.click(menuButton)

        const editButton = await screen.findByRole("menuitem", { name: "Edit" })
        await user.click(editButton)

        expect(mockHandleUpdatePlan).toHaveBeenCalledWith(
            mockPlan.planId,
            mockPlan.code,
            mockPlan.description,
            mockPlan.euro,
            mockPlan.planDate,
        )

        await user.click(menuButton)
        const deleteButton = screen.getByRole("menuitem", { name: "Delete" })
        await user.click(deleteButton)
        expect(mockHandleDeletePlan).toHaveBeenCalledWith(mockPlan)
    })
})
