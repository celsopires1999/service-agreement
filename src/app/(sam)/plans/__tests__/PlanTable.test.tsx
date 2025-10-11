import { setupMockTableHooks } from "@/app/__mocks__/mock-table-hooks"
import { getPlansType } from "@/lib/queries/plan"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PlanTable } from "../PlanTable"

// Mock the server action to prevent server-only code from being executed
jest.mock("@/actions/deletePlanAction", () => ({
    deletePlanAction: jest.fn(),
}))

const { mockToast, mockRouterReplace, mockExecute } = setupMockTableHooks()

const mockPlans: getPlansType[] = [
    {
        planId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        code: "PLAN-2024-001",
        description: "Alpha Plan",
        euro: "1.08",
        planDate: "2024-01-15T00:00:00.000Z",
    },
    {
        planId: "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
        code: "PLAN-2023-002",
        description: "Beta Plan",
        euro: "1.05",
        planDate: "2023-05-20T00:00:00.000Z",
    },
]

const mockHandleUpdatePlan = jest.fn()

describe("PlanTable", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (data: getPlansType[] = mockPlans) => {
        return render(
            <PlanTable data={data} handleUpdatePlan={mockHandleUpdatePlan} />,
        )
    }

    it("renders the table with plan data correctly", () => {
        renderComponent()

        expect(
            screen.getByRole("heading", { name: "List" }),
        ).toBeInTheDocument()

        // Check for table headers
        expect(
            screen.getByRole("columnheader", { name: /code/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: /description/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: /eur \/ usd/i }),
        ).toBeInTheDocument()

        // Check for table rows
        expect(
            screen.getByRole("cell", { name: "PLAN-2024-001" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "Alpha Plan" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "PLAN-2023-002" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "Beta Plan" }),
        ).toBeInTheDocument()
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
    })

    it("allows deleting a plan and shows success toast", async () => {
        mockExecute.mockResolvedValue({
            data: { message: "Plan deleted successfully." },
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
                /this will permanently delete the plan plan-2024-001/i,
            ),
        ).toBeInTheDocument()

        const continueButton = within(confirmationDialog).getByRole("button", {
            name: "Continue",
        })
        await user.click(continueButton)

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({
                planId: mockPlans[0].planId,
            })
        })

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "default",
                title: "Success! 🎉",
                description: "Plan deleted successfully.",
            })
        })

        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    })

    it("shows an error toast when plan deletion fails", async () => {
        mockExecute.mockResolvedValue({
            serverError: "Failed to delete plan.",
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
                description: "Failed to delete plan.",
            })
        })
    })

    it("calls handleUpdatePlan when edit button is clicked", async () => {
        const user = userEvent.setup()
        renderComponent()

        const rows = screen.getAllByRole("row")
        const firstDataRow = rows[1] // First row after header

        const actionsButton = within(firstDataRow).getByRole("button", {
            name: "Open Menu",
        })
        await user.click(actionsButton)

        const editMenuItem = await screen.findByRole("menuitem", {
            name: "Edit",
        })
        await user.click(editMenuItem)

        expect(mockHandleUpdatePlan).toHaveBeenCalledWith(
            mockPlans[0].planId,
            mockPlans[0].code,
            mockPlans[0].description,
            mockPlans[0].euro,
            mockPlans[0].planDate,
        )
    })

    it("handles pagination correctly", async () => {
        const user = userEvent.setup()
        const manyPlans = Array.from({ length: 15 }, (_, i) => ({
            ...mockPlans[0],
            planId: `p${"i"}`,
            code: `PLAN-2024-${String(i + 1).padStart(3, "0")}`,
        }))
        renderComponent(manyPlans)

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
