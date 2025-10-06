import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { getUserListItemsByServiceIdType } from "@/lib/queries/userList"
import { ActionsCell } from "../ActionsCell"

const mockUserListItem: getUserListItemsByServiceIdType = {
    userListItemId: "uli-1",
    name: "John Doe",
    email: "john.doe@example.com",
    corpUserId: "johndoe",
    area: "IT",
    costCenter: "IT-123",
}

const columnHelper = createColumnHelper<getUserListItemsByServiceIdType>()

const MockTable = ({
    userListItem,
}: {
    userListItem: getUserListItemsByServiceIdType
}) => {
    const columns = [
        columnHelper.accessor("name", {
            cell: (info) => info.getValue(),
        }),
        columnHelper.display({
            id: "actions",
            cell: (props) => <ActionsCell {...props} />,
        }),
    ]

    const table = useReactTable({
        data: [userListItem],
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

describe("ActionsCell for User List", () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(() => {
        user = userEvent.setup()
    })

    it("should render the menu button", () => {
        render(<MockTable userListItem={mockUserListItem} />)

        expect(
            screen.getByRole("button", { name: /open menu/i }),
        ).toBeInTheDocument()
    })

    it("should show the corpUserId in the menu label", async () => {
        render(<MockTable userListItem={mockUserListItem} />)

        await user.click(screen.getByRole("button", { name: /open menu/i }))

        expect(
            screen.getByText(mockUserListItem.corpUserId),
        ).toBeInTheDocument()
    })
})
