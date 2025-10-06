import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { getUserType } from "@/lib/queries/user"
import { ActionsCell } from "../ActionsCell"

const mockUser: getUserType = {
    userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    name: "Test User",
    email: "test@example.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
}

const columnHelper = createColumnHelper<getUserType>()

const MockTable = ({
    user,
    handleDeleteUser,
}: {
    user: getUserType
    handleDeleteUser: jest.Mock
}) => {
    const columns = [
        columnHelper.accessor("name", {
            cell: (info) => info.getValue(),
        }),
        columnHelper.display({
            id: "actions",
            cell: (props) => (
                <ActionsCell {...props} handleDeleteUser={handleDeleteUser} />
            ),
        }),
    ]

    const table = useReactTable({
        data: [user],
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

describe("ActionsCell for Users", () => {
    let user: ReturnType<typeof userEvent.setup>
    let mockHandleDeleteUser: jest.Mock

    beforeEach(() => {
        user = userEvent.setup()
        mockHandleDeleteUser = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should render the menu button and show correct menu items", async () => {
        render(
            <MockTable
                user={mockUser}
                handleDeleteUser={mockHandleDeleteUser}
            />,
        )

        const menuButton = screen.getByRole("button", { name: /open menu/i })
        expect(menuButton).toBeInTheDocument()

        await user.click(menuButton)

        expect(screen.getByText("User")).toBeInTheDocument()

        const editLink = screen.getByRole("menuitem", { name: "Edit" })
        expect(editLink).toBeInTheDocument()
        expect(editLink.closest("a")).toHaveAttribute(
            "href",
            `/users/form?userId=${mockUser.userId}`,
        )

        const deleteButton = screen.getByRole("menuitem", {
            name: "Delete",
        })
        expect(deleteButton).toBeInTheDocument()

        await user.click(deleteButton)

        expect(mockHandleDeleteUser).toHaveBeenCalledWith(mockUser)
        expect(mockHandleDeleteUser).toHaveBeenCalledTimes(1)
    })
})
