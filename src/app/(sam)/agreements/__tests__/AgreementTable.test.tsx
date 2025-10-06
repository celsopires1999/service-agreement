import { setupMockTableHooks } from "@/app/__mocks__/mock-table-hooks"
import { getAgreementSearchResultsType } from "@/lib/queries/agreement"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AgreementTable } from "../AgreementTable"

// Mock the server action to prevent server-only code from being executed
jest.mock("@/actions/deleteAgreementAction", () => ({
    deleteAgreementAction: jest.fn(),
}))

const { mockToast, mockRouterReplace, mockExecute } = setupMockTableHooks()

const mockAgreements: getAgreementSearchResultsType[] = [
    {
        agreementId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        code: "AG-2024-001",
        name: "Alpha Agreement",
        year: 2024,
        localPlan: "Local Plan A",
        localPlanId: "lp-1",
        isRevised: false,
        revision: 1,
        revisionDate: "2024-01-15T00:00:00.000Z",
        contactEmail: "alpha@test.com",
        description: "Description for Alpha Agreement",
        comment: null,
        providerPlanId: "pp-1",
    },
    {
        agreementId: "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
        code: "AG-2023-002",
        name: "Beta Agreement",
        year: 2023,
        localPlan: "Local Plan B",
        localPlanId: "lp-2",
        isRevised: true,
        revision: 2,
        revisionDate: "2023-05-20T00:00:00.000Z",
        contactEmail: "beta@test.com",
        description: "Description for Beta Agreement",
        comment: "This is a comment",
        providerPlanId: "pp-2",
    },
]

describe("AgreementTable", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (
        data: getAgreementSearchResultsType[] = mockAgreements,
    ) => {
        return render(<AgreementTable data={data} />)
    }

    it("renders the table with agreement data correctly", () => {
        renderComponent()

        expect(
            screen.getByRole("heading", { name: "Agreements List" }),
        ).toBeInTheDocument()

        // Check for table headers
        expect(
            screen.getByRole("columnheader", { name: /code/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: /agreement/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: /contact email/i }),
        ).toBeInTheDocument()

        // Check for table rows
        expect(
            screen.getByRole("cell", { name: "AG-2024-001" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "Alpha Agreement" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "AG-2023-002" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "Beta Agreement" }),
        ).toBeInTheDocument()
    })

    it("navigates to the new agreement form when the add button is clicked", () => {
        renderComponent()
        const addButton = screen.getByTestId("list-plus-icon")
        expect(addButton).toBeInTheDocument()
        expect(addButton.closest("a")).toHaveAttribute(
            "href",
            "/agreements/form",
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
        // In a real app, a re-render would show the inputs.
        // For this test, we confirm the state-updating call was made.
    })

    it("allows deleting an agreement and shows success toast", async () => {
        mockExecute.mockResolvedValue({
            data: { message: "Agreement deleted successfully." },
        })
        const user = userEvent.setup()
        renderComponent()

        const rows = screen.getAllByRole("row")
        const firstDataRow = rows[1] // First row after header

        const actionsButton = within(firstDataRow).getByRole("button", {
            name: "Open Menu",
        })
        await user.click(actionsButton)

        const deleteMenuItem = await screen.findByRole("menuitem", {
            name: "Delete",
        })
        await user.click(deleteMenuItem)

        const confirmationDialog = await screen.findByRole("alertdialog")
        expect(
            within(confirmationDialog).getByRole("heading", {
                name: /are you sure/i,
            }),
        ).toBeInTheDocument()
        expect(
            within(confirmationDialog).getByText(
                /this will permanently delete the agreement ag-2024-001/i,
            ),
        ).toBeInTheDocument()

        const continueButton = within(confirmationDialog).getByRole("button", {
            name: "Continue",
        })
        await user.click(continueButton)

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({
                agreementId: mockAgreements[0].agreementId,
            })
        })

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "default",
                title: "Success! 🎉",
                description: "Agreement deleted successfully.",
            })
        })

        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    })

    it("shows an error toast when agreement deletion fails", async () => {
        mockExecute.mockResolvedValue({
            serverError: "Failed to delete agreement.",
        })
        const user = userEvent.setup()
        renderComponent()

        const rows = screen.getAllByRole("row")
        const firstDataRow = rows[1]

        const actionsButton = within(firstDataRow).getByRole("button", {
            name: "Open Menu",
        })
        await user.click(actionsButton)

        const deleteButton = await screen.findByRole("menuitem", {
            name: "Delete",
        })
        await user.click(deleteButton)

        const continueButton = screen.getByRole("button", { name: "Continue" })
        await user.click(continueButton)

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalled()
        })

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete agreement.",
            })
        })
    })

    it("navigates to the correct edit page when an agreement code is clicked", () => {
        renderComponent()

        const agreementLink = screen.getByRole("link", { name: "AG-2024-001" })
        expect(agreementLink).toBeInTheDocument()
        expect(agreementLink).toHaveAttribute(
            "href",
            `/agreements/form?agreementId=${mockAgreements[0].agreementId}`,
        )
    })

    it("handles pagination correctly", async () => {
        const user = userEvent.setup()
        const manyAgreements = Array.from({ length: 15 }, (_, i) => ({
            ...mockAgreements[0],
            agreementId: `a${i}`,
            code: `AG-2024-${String(i + 1).padStart(3, "0")}`,
        }))
        renderComponent(manyAgreements)

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
