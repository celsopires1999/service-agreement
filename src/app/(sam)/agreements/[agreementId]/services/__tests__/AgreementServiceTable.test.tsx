import { setupMockTableHooks } from "@/app/__mocks__/mock-table-hooks"
import { getAgreementType } from "@/lib/queries/agreement"
import { getServiceSearchResultsType } from "@/lib/queries/service"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AgreementServiceTable } from "../AgreementServiceTable"

// Mock the server action to prevent server-only code from being executed
jest.mock("@/actions/deleteServiceAction", () => ({
    deleteServiceAction: jest.fn(),
}))

const { mockToast, mockRouterReplace, mockExecute } = setupMockTableHooks()

const mockAgreement: getAgreementType = {
    agreementId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    code: "AG-2024-001",
    name: "Test Agreement",
    year: 2024,
    localPlan: "Local Plan A",
    isRevised: false,
    revision: 1,
    revisionDate: "2024-01-01",
    providerPlanId: "p1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
    localPlanId: "l1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
    description: "An agreement for testing purposes.",
    contactEmail: "contact@test.com",
    comment: null,
    documentUrl: null,
}

const mockServices: getServiceSearchResultsType[] = [
    {
        serviceId: "s1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        agreementId: mockAgreement.agreementId,
        name: "Service Alpha",
        amount: "1000.00",
        currency: "USD",
        responsibleEmail: "resp1@test.com",
        validatorEmail: "validator1@test.com",
        status: "created",
        isRevised: false,
        agreementCode: mockAgreement.code,
        agreementName: mockAgreement.name,
        year: mockAgreement.year,
        revision: mockAgreement.revision,
        revisionDate: mockAgreement.revisionDate,
        localPlan: mockAgreement.localPlan,
    },
    {
        serviceId: "s2b3c4d5-e6f7-8901-2345-67890abcdef",
        agreementId: mockAgreement.agreementId,
        name: "Service Beta",
        amount: "2500.50",
        currency: "EUR",
        responsibleEmail: "resp2@test.com",
        validatorEmail: "validator2@test.com",
        status: "approved",
        isRevised: false,
        agreementCode: mockAgreement.code,
        agreementName: mockAgreement.name,
        year: mockAgreement.year,
        revision: mockAgreement.revision,
        revisionDate: mockAgreement.revisionDate,
        localPlan: mockAgreement.localPlan,
    },
]

describe("AgreementServiceTable", () => {
    const renderComponent = (
        data: getServiceSearchResultsType[] = mockServices,
    ) => {
        return render(
            <AgreementServiceTable data={data} agreement={mockAgreement} />,
        )
    }

    it("renders the table with service data correctly", () => {
        renderComponent()

        expect(
            screen.getByRole("heading", { name: "Agreement Services" }),
        ).toBeInTheDocument()
        expect(screen.getByText(mockAgreement.code)).toBeInTheDocument()
        expect(screen.getByText(mockAgreement.name)).toBeInTheDocument()

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

        // Check for table rows
        expect(
            screen.getByRole("cell", { name: "Service Alpha" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "Service Beta" }),
        ).toBeInTheDocument()
    })

    it('renders "Add First Service" button when there is no data', () => {
        renderComponent([])
        const addButton = screen.getByRole("link", {
            name: /add first service/i,
        })
        expect(addButton).toBeInTheDocument()
        expect(addButton).toHaveAttribute(
            "href",
            `/services/form?agreementId=${mockAgreement.agreementId}`,
        )
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
            name: "Open Menu",
        })
        await user.click(actionsButton)

        const serviceSubMenu = await screen.findByRole("menuitem", {
            name: /service/i,
        })
        await user.hover(serviceSubMenu)

        await waitFor(async () => {
            const deleteMenuItem = await screen.findByRole("menuitem", {
                name: "Delete",
            })
            deleteMenuItem.focus()
        })

        await user.keyboard("{enter}")

        const confirmationDialog = await screen.findByRole("alertdialog")
        await waitFor(() => {
            expect(
                within(confirmationDialog).getByRole("heading", {
                    name: /are you sure/i,
                }),
            ).toBeInTheDocument()
        })
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
        const firstDataRow = rows[1]

        const actionsButton = within(firstDataRow).getByRole("button", {
            name: "Open Menu",
        })
        await user.click(actionsButton)

        const serviceSubMenu = await screen.findByRole("menuitem", {
            name: /service/i,
        })
        await user.hover(serviceSubMenu)

        await waitFor(async () => {
            const deleteButton = await screen.findByRole("menuitem", {
                name: "Delete",
            })
            deleteButton.focus()
            await user.keyboard("{enter}")
        })

        const continueButton = screen.getByRole("button", { name: "Continue" })
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
