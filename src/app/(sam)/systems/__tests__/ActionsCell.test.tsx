import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { getSystemType } from "@/lib/queries/system"
import { ActionsCell } from "../ActionsCell"

const mockSystem: getSystemType = {
    systemId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    name: "Test System",
    description: "A system for testing purposes",
    applicationId: "APP-001",
    createdAt: new Date(),
    updatedAt: new Date(),
}

const columnHelper = createColumnHelper<getSystemType>()

const MockTable = ({
    system,
    handleDeleteSystem,
}: {
    system: getSystemType
    handleDeleteSystem: jest.Mock
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
                    handleDeleteSystem={handleDeleteSystem}
                />
            ),
        }),
    ]

    const table = useReactTable({
        data: [system],
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

describe("ActionsCell for Systems", () => {
    let user: ReturnType<typeof userEvent.setup>
    let mockHandleDeleteSystem: jest.Mock

    beforeEach(() => {
        user = userEvent.setup()
        mockHandleDeleteSystem = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should render the menu button and show correct menu items", async () => {
        render(
            <MockTable
                system={mockSystem}
                handleDeleteSystem={mockHandleDeleteSystem}
            />,
        )

        // Verifica se o botão do menu está presente
        const menuButton = screen.getByRole("button", { name: /open menu/i })
        expect(menuButton).toBeInTheDocument()

        // Abre o menu
        await user.click(menuButton)

        // Verifica os itens de menu para "System"
        expect(screen.getByText("System")).toBeInTheDocument()

        const editLink = screen.getByRole("menuitem", { name: "Edit" })
        expect(editLink).toBeInTheDocument()
        expect(editLink.closest("a")).toHaveAttribute(
            "href",
            `/systems/form?systemId=${mockSystem.systemId}`,
        )

        const costLink = screen.getByRole("menuitem", { name: "Cost" })
        expect(costLink).toBeInTheDocument()
        expect(costLink.closest("a")).toHaveAttribute(
            "href",
            `/systems/${mockSystem.systemId}`,
        )

        const deleteButton = screen.getByRole("menuitem", { name: "Delete" })
        expect(deleteButton).toBeInTheDocument()

        // Clica no botão de deletar e verifica se a função mock foi chamada
        await user.click(deleteButton)
        expect(mockHandleDeleteSystem).toHaveBeenCalledWith(mockSystem)
        expect(mockHandleDeleteSystem).toHaveBeenCalledTimes(1)
    })
})
