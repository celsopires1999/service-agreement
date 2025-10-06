import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { getAgreementSearchResultsType } from "@/lib/queries/agreement"
import { ActionsCell } from "../ActionsCell"

const mockAgreement: getAgreementSearchResultsType = {
    agreementId: "f1e2d3c4-b5a6-7890-1234-567890abcdef",
    code: "AG-001",
    name: "Test Agreement",
    year: 2024,
    revision: 1,
    revisionDate: "2024-01-01",
    localPlan: "LP-2024",
    isRevised: false,
    description: "A test agreement",
    contactEmail: "test@example.com",
    comment: null,
    providerPlanId: "pp-123",
    localPlanId: "lp-123",
}

const columnHelper = createColumnHelper<getAgreementSearchResultsType>()

const MockTable = ({
    agreement,
    handleDeleteAgreement,
}: {
    agreement: getAgreementSearchResultsType
    handleDeleteAgreement: jest.Mock
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
                    handleDeleteAgreement={handleDeleteAgreement}
                />
            ),
        }),
    ]

    const table = useReactTable({
        data: [agreement],
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

describe("ActionsCell for Agreements", () => {
    let user: ReturnType<typeof userEvent.setup>
    let mockHandleDeleteAgreement: jest.Mock

    beforeEach(() => {
        user = userEvent.setup()
        mockHandleDeleteAgreement = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should render the menu button", () => {
        render(
            <MockTable
                agreement={mockAgreement}
                handleDeleteAgreement={mockHandleDeleteAgreement}
            />,
        )

        expect(
            screen.getByRole("button", { name: /open menu/i }),
        ).toBeInTheDocument()
    })

    it("should show correct menu items for an agreement", async () => {
        render(
            <MockTable
                agreement={mockAgreement}
                handleDeleteAgreement={mockHandleDeleteAgreement}
            />,
        )

        await user.click(screen.getByRole("button", { name: /open menu/i }))

        // Agreement actions
        expect(screen.getByText("Agreement")).toBeInTheDocument()

        const editLink = screen.getByRole("menuitem", { name: "Edit" })
        expect(editLink).toBeInTheDocument()
        expect(editLink.closest("a")).toHaveAttribute(
            "href",
            `/agreements/form?agreementId=${mockAgreement.agreementId}`,
        )

        const revisionLink = screen.getByRole("menuitem", { name: "Revision" })
        expect(revisionLink).toBeInTheDocument()
        expect(revisionLink.closest("a")).toHaveAttribute(
            "href",
            `/agreements/${mockAgreement.agreementId}/new-revision`,
        )

        const deleteButton = screen.getByRole("menuitem", {
            name: "Delete",
        })
        expect(deleteButton).toBeInTheDocument()

        await waitFor(() => {
            deleteButton.focus()
        })

        await user.keyboard("{enter}")

        expect(mockHandleDeleteAgreement).toHaveBeenCalledWith(mockAgreement)

        // Re-open menu to check Service actions
        await user.keyboard("{escape}")
        await user.click(screen.getByRole("button", { name: /open menu/i }))

        // Service actions
        expect(screen.getByText("Service")).toBeInTheDocument()

        const listLink = screen.getByRole("menuitem", { name: "List" })
        expect(listLink).toBeInTheDocument()
        expect(listLink.closest("a")).toHaveAttribute(
            "href",
            `/agreements/${mockAgreement.agreementId}/services`,
        )

        const addLink = screen.getByRole("menuitem", { name: "Add" })
        expect(addLink).toBeInTheDocument()
        expect(addLink.closest("a")).toHaveAttribute(
            "href",
            `/services/form?agreementId=${mockAgreement.agreementId}`,
        )
    })
})
