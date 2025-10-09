import { setupMockTableHooks } from "@/app/__mocks__/mock-table-hooks"
import { getServicesBySystemIdType } from "@/lib/queries/service"
import { render, screen } from "@testing-library/react"
import { SystemServicesTable } from "../SystemServicesTable"
import userEvent from "@testing-library/user-event"

const { mockRouterReplace, mockUseSearchParams } = setupMockTableHooks()

const mockData: getServicesBySystemIdType[] = [
    {
        year: 2024,
        agreementId: "agr1",
        agreementName: "Agreement 1",
        serviceId: "svc1",
        serviceName: "Service 1",
        systemAllocation: "50.00",
        systemRunAmount: "100.00",
        systemChgAmount: "10.00",
        systemAmount: "110.00",
        systemCurrency: "USD",
        serviceRunAmount: "200.00",
        serviceChgAmount: "20.00",
        serviceAmount: "220.00",
        serviceCurrency: "USD",
        serviceIsActive: true,
    },
    {
        year: 2024,
        agreementId: "agr2",
        agreementName: "Agreement 2",
        serviceId: "svc2",
        serviceName: "Service 2",
        systemAllocation: "25.00",
        systemRunAmount: "210.00",
        systemChgAmount: "30.00",
        systemAmount: "240.00",
        systemCurrency: "USD",
        serviceRunAmount: "800.00",
        serviceChgAmount: "80.00",
        serviceAmount: "880.00",
        serviceCurrency: "EUR",
        serviceIsActive: false,
    },
]

describe("SystemServicesTable", () => {
    it("should render the table with correct headers", () => {
        render(<SystemServicesTable data={mockData} />)

        expect(screen.getByText("Agreement")).toBeInTheDocument()
        expect(screen.getByText("Service")).toBeInTheDocument()
        expect(screen.getByText("Alloc (%)")).toBeInTheDocument()
        expect(screen.getByText("Run (USD)")).toBeInTheDocument()
        expect(screen.getByText("Change (USD)")).toBeInTheDocument()
        expect(screen.getByText("Total (USD)")).toBeInTheDocument()
        expect(screen.getByText("Service Amount")).toBeInTheDocument()
        expect(screen.getByText("Currency")).toBeInTheDocument()
        expect(screen.getByText("Allocated")).toBeInTheDocument()
    })

    it("should render the table with correct data and formatting", () => {
        render(<SystemServicesTable data={mockData} />)

        // Row 1
        expect(screen.getByText("Agreement 1")).toBeInTheDocument()
        expect(screen.getByText("Service 1")).toBeInTheDocument()
        expect(screen.getByText("50,00")).toBeInTheDocument()
        expect(screen.getByText("100,00")).toBeInTheDocument()
        expect(screen.getByText("10,00")).toBeInTheDocument()
        expect(screen.getByText("110,00")).toBeInTheDocument()
        expect(screen.getByText("220,00")).toBeInTheDocument()
        expect(screen.getByText("USD")).toBeInTheDocument()
        expect(
            screen.getAllByTestId("circle-check-icon-icon")[0],
        ).toBeInTheDocument()

        // Row 2
        expect(screen.getByText("Agreement 2")).toBeInTheDocument()
        expect(screen.getByText("Service 2")).toBeInTheDocument()
        expect(screen.getByText("25,00")).toBeInTheDocument()
        expect(screen.getByText("210,00")).toBeInTheDocument()
        expect(screen.getByText("30,00")).toBeInTheDocument()
        expect(screen.getByText("240,00")).toBeInTheDocument()
        expect(screen.getByText("880,00")).toBeInTheDocument()
        expect(screen.getByText("EUR")).toBeInTheDocument()
        expect(screen.getByTestId("circle-x-icon-icon")).toBeInTheDocument()
    })

    it("should calculate and display the grand total in the footer", () => {
        render(<SystemServicesTable data={mockData} />)

        expect(screen.getByText("Grand Total")).toBeInTheDocument()

        // Total Run: 100.00 + 210.00 = 300.00
        const runTotalCell = screen.getAllByText("310,00")
        expect(runTotalCell.length).toBe(1)
        expect(runTotalCell[0].closest("td")).toHaveClass("text-right")

        // Total Change: 10.00 + 30.00 = 40.00
        const chgTotalCell = screen.getAllByText("40,00")
        expect(chgTotalCell.length).toBe(1)
        expect(chgTotalCell[0].closest("td")).toHaveClass("text-right")

        // Total Amount: 110.00 + 240.00 = 350.00
        const amountTotalCell = screen.getAllByText("350,00")
        expect(amountTotalCell.length).toBe(1)
        expect(amountTotalCell[0].closest("td")).toHaveClass("text-right")
    })

    it("should display correct pagination info", () => {
        render(<SystemServicesTable data={mockData} />)

        expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument()
        expect(screen.getByText(/\[2 total results\]/)).toBeInTheDocument()
    })

    it("should handle next page click", async () => {
        const longData = Array.from({ length: 15 }, (_, i) => ({
            ...mockData[0],
            serviceId: `svc${i}`,
        }))
        const user = userEvent.setup()
        render(<SystemServicesTable data={longData} />)

        const nextButton = screen.getByRole("button", { name: "Next" })
        expect(nextButton).not.toBeDisabled()

        await user.click(nextButton)

        expect(mockRouterReplace).toHaveBeenCalledWith("?page=2", {
            scroll: false,
        })
    })

    it("should handle previous page click", async () => {
        const user = userEvent.setup()
        mockUseSearchParams.mockReturnValue(new URLSearchParams("page=2"))
        const longData = Array.from({ length: 15 }, (_, i) => ({
            ...mockData[0],
            serviceId: `svc${i}`,
        }))

        render(<SystemServicesTable data={longData} />)

        const previousButton = screen.getByRole("button", { name: "Previous" })
        expect(previousButton).not.toBeDisabled()

        await user.click(previousButton)

        expect(mockRouterReplace).toHaveBeenCalledWith("?page=1", {
            scroll: false,
        })
    })

    it("should disable pagination buttons appropriately", async () => {
        mockUseSearchParams.mockReturnValue(new URLSearchParams("page=1"))
        render(<SystemServicesTable data={mockData} />)

        const previousButton = screen.getByRole("button", { name: /previous/i })
        const nextButton = screen.getByRole("button", { name: /next/i })

        expect(previousButton).toBeDisabled()
        expect(nextButton).toBeDisabled()
    })

    it("should render '1 result' when there is only one item", () => {
        render(<SystemServicesTable data={[mockData[0]]} />)
        expect(screen.getByText(/\[1 result\]/)).toBeInTheDocument()
    })
})
