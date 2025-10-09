import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { getServicesBySystemIdType } from "@/lib/queries/service"
import { ActionsCell } from "../ActionsCell"

const mockService: getServicesBySystemIdType = {
    year: 2024,
    serviceName: "Test Service",
    systemAllocation: "50.000000",
    systemRunAmount: "500.00",
    systemChgAmount: "50.00",
    systemAmount: "550.00",
    systemCurrency: "USD",
    serviceId: "s1e2d3c4-b5a6-7890-1234-567890abcdef",
    serviceRunAmount: "1000.00",
    serviceChgAmount: "100.00",
    serviceAmount: "1100.00",
    serviceCurrency: "USD",
    serviceIsActive: true,
    agreementId: "a1e2d3c4-b5a6-7890-1234-567890abcdef",
    agreementName: "Test Agreement",
}

const columnHelper = createColumnHelper<getServicesBySystemIdType>()

const MockTable = ({ service }: { service: getServicesBySystemIdType }) => {
    const columns = [
        columnHelper.accessor("serviceName", {
            cell: (info) => info.getValue(),
        }),
        columnHelper.display({
            id: "actions",
            cell: (props) => <ActionsCell {...props} />,
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

describe("ActionsCell for System Services", () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(() => {
        user = userEvent.setup()
    })

    it("should render the menu button and show correct menu items", async () => {
        render(<MockTable service={mockService} />)

        await user.click(screen.getByRole("button", { name: /open menu/i }))

        expect(screen.getByText("Options")).toBeInTheDocument()

        const agreementLink = screen.getByRole("menuitem", {
            name: "Agreement",
        })
        expect(agreementLink).toBeInTheDocument()
        expect(agreementLink.closest("a")).toHaveAttribute(
            "href",
            `/agreements/form?agreementId=${mockService.agreementId}`,
        )

        const serviceLink = screen.getByRole("menuitem", { name: "Service" })
        expect(serviceLink).toBeInTheDocument()
        expect(serviceLink.closest("a")).toHaveAttribute(
            "href",
            `/services/form?serviceId=${mockService.serviceId}`,
        )

        const allocationLink = screen.getByRole("menuitem", {
            name: "Allocation",
        })
        expect(allocationLink).toBeInTheDocument()
        expect(allocationLink.closest("a")).toHaveAttribute(
            "href",
            `/services/${mockService.serviceId}`,
        )
    })
})
