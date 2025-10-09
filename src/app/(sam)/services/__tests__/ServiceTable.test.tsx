import { setupMockTableHooks } from "@/app/__mocks__/mock-table-hooks"
import { getServiceSearchResultsType } from "@/lib/queries/service"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ServiceTable } from "../ServiceTable"

// Mock the server action to prevent server-only code from being executed
jest.mock("@/actions/deleteServiceAction", () => ({
    deleteServiceAction: jest.fn(),
}))

const { mockToast, mockRouterReplace, mockExecute } = setupMockTableHooks()

const mockServices: getServiceSearchResultsType[] = [
    {
        serviceId: "s1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        agreementId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        name: "Service Alpha",
        amount: "1000.00",
        currency: "USD",
        responsibleEmail: "resp1@test.com",
        validatorEmail: "validator1@test.com",
        status: "created",
        isRevised: false,
        agreementCode: "AG-2024-001",
        agreementName: "Test Agreement",
        year: 2024,
        revision: 1,
        revisionDate: "2024-01-01",
        localPlan: "Local Plan A",
    },
    {
        serviceId: "s2b3c4d5-e6f7-8901-2345-67890abcdef",
        agreementId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        name: "Service Beta",
        amount: "2500.50",
        currency: "EUR",
        responsibleEmail: "resp2@test.com",
        validatorEmail: "validator2@test.com",
        status: "approved",
        isRevised: false,
        agreementCode: "AG-2024-002",
        agreementName: "Another Agreement",
        year: 2024,
        revision: 1,
        revisionDate: "2024-01-01",
        localPlan: "Local Plan B",
    },
]

describe("ServiceTable", () => {
    const renderComponent = (
        data: getServiceSearchResultsType[] = mockServices,
    ) => {
        return render(<ServiceTable data={data} />)
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("renders the table with service data correctly", () => {
        renderComponent()

        expect(
            screen.getByRole("heading", { name: "Services List" }),
        ).toBeInTheDocument()

        // Check for table headers
        expect(
            screen.getByRole("columnheader", { name: "Service" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: "Amount" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: "Currency" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: "Validator" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: "Agreement" }),
        ).toBeInTheDocument()

        // Check for table rows
        expect(
            screen.getByRole("cell", { name: "Service Alpha" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "Service Beta" }),
        ).toBeInTheDocument()
    })

    it("renders an empty state message when there is no data", () => {
        renderComponent([])
        expect(screen.getByText(/\[0 total results\]/i)).toBeInTheDocument()
        expect(screen.queryByRole("cell")).not.toBeInTheDocument()
    })

    it("toggles filter inputs when the filter switch is clicked", async () => {
        const user = userEvent.setup()
        renderComponent()

        const filterSwitch = screen.getByRole("switch", { name: "Filter" })
        expect(
            screen.queryByPlaceholderText(/search.../i),
        ).not.toBeInTheDocument()

        await user.click(filterSwitch)

        expect(mockRouterReplace).toHaveBeenCalledWith("?filterToggle=true", {
            scroll: false,
        })
        // Re-render would happen here in a real app, for test we can check for inputs
    })

    it("allows deleting a service and shows success toast", async () => {
        mockExecute.mockResolvedValue({
            data: { message: "Service deleted successfully." },
        })
        const user = userEvent.setup()
        renderComponent()

        const rows = screen.getAllByRole("row")
        const firstDataRow = rows[1] // First row after header

        const actionsButton = within(firstDataRow).getByRole("button", {
            name: /open menu/i,
        })

        await user.click(actionsButton)

        const menuitem = screen.getByRole("menuitem", {
            name: /service/i,
        })

        within(menuitem).getByText(/service/i)

        await user.click(within(menuitem).getByText(/service/i))

        const deleteMenuItem = await screen.findByRole("menuitem", {
            name: "Delete",
        })

        await waitFor(() => {
            deleteMenuItem.focus()
        })

        await user.keyboard("{enter}")

        const confirmationDialog = await screen.findByRole("alertdialog")
        expect(
            within(confirmationDialog).getByRole("heading", {
                name: /are you sure/i,
            }),
        ).toBeInTheDocument()
        expect(
            within(confirmationDialog).getByText(
                /this will permanently delete the service service alpha/i,
            ),
        ).toBeInTheDocument()

        const continueButton = within(confirmationDialog).getByRole("button", {
            name: "Continue",
        })
        await user.click(continueButton)

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({
                serviceId: mockServices[0].serviceId,
            })
        })

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "default",
                title: "Success! 🎉",
                description: "Service deleted successfully.",
            })
        })

        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    })

    it("shows an error toast when service deletion fails", async () => {
        mockExecute.mockResolvedValue({
            serverError: "Failed to delete service.",
        })

        const user = userEvent.setup()
        renderComponent()

        const rows = screen.getAllByRole("row")
        const firstDataRow = rows[1] // First row after header

        const actionsButton = within(firstDataRow).getByRole("button", {
            name: /open menu/i,
        })

        await user.click(actionsButton)

        const menuitem = screen.getByRole("menuitem", {
            name: /service/i,
        })

        within(menuitem).getByText(/service/i)

        await user.click(within(menuitem).getByText(/service/i))

        const deleteMenuItem = await screen.findByRole("menuitem", {
            name: "Delete",
        })

        await waitFor(() => {
            deleteMenuItem.focus()
        })

        await user.keyboard("{enter}")

        const confirmationDialog = await screen.findByRole("alertdialog")
        expect(
            within(confirmationDialog).getByRole("heading", {
                name: /are you sure/i,
            }),
        ).toBeInTheDocument()
        expect(
            within(confirmationDialog).getByText(
                /this will permanently delete the service service alpha/i,
            ),
        ).toBeInTheDocument()

        const continueButton = within(confirmationDialog).getByRole("button", {
            name: "Continue",
        })
        await user.click(continueButton)

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalled()
        })

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete service.",
            })
        })
    })

    it("navigates to the correct edit page when a row is clicked", async () => {
        renderComponent()

        const serviceLink = screen.getByRole("link", { name: "Service Alpha" })
        expect(serviceLink).toBeInTheDocument()
        expect(serviceLink).toHaveAttribute(
            "href",
            `/services/form?serviceId=${mockServices[0].serviceId}`,
        )
    })

    it("handles pagination correctly", async () => {
        const user = userEvent.setup()
        const manyServices = Array.from({ length: 15 }, (_, i) => ({
            ...mockServices[0],
            serviceId: `s${i}`,
            name: `Service ${i + 1}`,
        }))
        renderComponent(manyServices)

        expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
        const nextButton = screen.getByRole("button", { name: "Next" })
        const prevButton = screen.getByRole("button", { name: "Previous" })

        expect(prevButton).toBeDisabled()
        expect(nextButton).toBeEnabled()

        await user.click(nextButton)

        expect(mockRouterReplace).toHaveBeenCalledWith("?page=2", {
            scroll: false,
        })
    })
})
