import { setupMockFormHooks } from "@/app/__mocks__/mock-form-hooks"
import { getPlansType } from "@/lib/queries/plan"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PlanForm } from "../PlanForm"

// Mock the server actions
jest.mock("@/actions/savePlanAction", () => ({
    savePlanAction: jest.fn(),
}))

jest.mock("@/actions/deletePlanAction", () => ({
    deletePlanAction: jest.fn(),
}))

// Mock the centralized form hooks setup
const { mockExecute, mockToast } = setupMockFormHooks()

const mockPlans: getPlansType[] = [
    {
        planId: "ed2dbd55-511e-4b20-b96c-804c696a34f3",
        code: "BP25",
        description: "Business Plan 2025",
        euro: "1.0501",
        planDate: "2024-07-01",
    },
    {
        planId: "5df1b08d-d48b-427c-9fe4-8018b66b9df6",
        code: "FC0324",
        description: "Revision 04 2024",
        euro: "1.0602",
        planDate: "2024-03-15",
    },
]

describe("PlanForm", () => {
    const user = userEvent.setup()

    const renderComponent = (props: { plans: getPlansType[] }) => {
        render(<PlanForm {...props} />)
    }

    it("should render the form and table with initial data", () => {
        renderComponent({ plans: mockPlans })

        expect(
            screen.getByRole("heading", { name: /company plans/i }),
        ).toBeInTheDocument()
        expect(screen.getByLabelText(/code/i)).toHaveValue("")
        expect(screen.getByLabelText(/description/i)).toHaveValue("")

        // Check if table is rendered with plans
        expect(screen.getByRole("cell", { name: "BP25" })).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "Business Plan 2025" }),
        ).toBeInTheDocument()
        expect(screen.getByRole("cell", { name: "FC0324" })).toBeInTheDocument()
    })

    it("should display validation errors when submitting an empty form", async () => {
        renderComponent({ plans: [] })

        await user.clear(screen.getByLabelText(/eur \/ usd/i))
        await user.type(screen.getByLabelText(/eur \/ usd/i), "1.0001")
        await user.click(screen.getByRole("button", { name: /save/i }))

        expect(await screen.findByText("Code is required")).toBeInTheDocument()
        expect(
            await screen.findByText("Description is required"),
        ).toBeInTheDocument()
        expect(await screen.findByText("Invalid plan date")).toBeInTheDocument()
        expect(mockExecute).not.toHaveBeenCalled()
    })

    it("should successfully create a new plan on submit", async () => {
        mockExecute.mockResolvedValue({
            data: { message: "Plan created successfully" },
        })
        renderComponent({ plans: [] })

        await user.type(screen.getByLabelText(/code/i), "NEW-PLAN")
        await user.type(screen.getByLabelText(/description/i), "A new plan")
        await user.clear(screen.getByLabelText(/eur \/ usd/i))
        await user.type(screen.getByLabelText(/eur \/ usd/i), "1.2345")
        await user.type(screen.getByLabelText(/plan date/i), "2025-01-01")

        await user.click(screen.getByRole("button", { name: /save/i }))

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({
                planId: "(New)",
                code: "NEW-PLAN",
                description: "A new plan",
                euro: "1.2345",
                planDate: "2025-01-01",
            })
        })

        expect(mockToast).toHaveBeenCalledWith({
            variant: "default",
            title: "Success! 🎉",
            description: "Plan created successfully",
        })
    })

    it("should populate the form when the edit button of a plan is clicked", async () => {
        renderComponent({ plans: mockPlans })

        const editButtons = screen.getAllByRole("button", {
            name: /open menu/i,
        })
        await user.click(editButtons[0]) // Click menu for the first plan
        await user.click(screen.getByRole("menuitem", { name: /edit/i }))

        expect(screen.getByLabelText(/code/i)).toHaveValue(mockPlans[0].code)
        expect(screen.getByLabelText(/description/i)).toHaveValue(
            mockPlans[0].description,
        )
        expect(screen.getByLabelText(/eur \/ usd/i)).toHaveValue(1.0501)
        expect(screen.getByLabelText(/plan date/i)).toHaveValue(
            mockPlans[0].planDate,
        )
    })

    it("should successfully update an existing plan", async () => {
        mockExecute.mockResolvedValue({
            data: { message: "Plan updated successfully" },
        })
        renderComponent({ plans: mockPlans })

        // Populate form for editing
        const editButtons = screen.getAllByRole("button", {
            name: /open menu/i,
        })
        await user.click(editButtons[0])
        await user.click(screen.getByRole("menuitem", { name: /edit/i }))

        // Modify a field
        const descriptionInput = screen.getByLabelText(/description/i)
        await user.clear(descriptionInput)
        await user.type(descriptionInput, "Updated Business Plan")

        await user.click(screen.getByRole("button", { name: /save/i }))

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith(
                expect.objectContaining({
                    planId: mockPlans[0].planId,
                    description: "Updated Business Plan",
                }),
            )
        })

        expect(mockToast).toHaveBeenCalledWith({
            variant: "default",
            title: "Success! 🎉",
            description: "Plan updated successfully",
        })
    })

    it("should show a server error toast on save failure", async () => {
        mockExecute.mockResolvedValue({
            serverError: "Database connection failed",
        })
        renderComponent({ plans: [] })

        await user.type(screen.getByLabelText(/code/i), "FAIL-PLAN")
        await user.type(screen.getByLabelText(/description/i), "This will fail")
        await user.clear(screen.getByLabelText(/eur \/ usd/i))
        await user.type(screen.getByLabelText(/eur \/ usd/i), "1.1")
        await user.type(screen.getByLabelText(/plan date/i), "2025-02-01")

        await user.click(screen.getByRole("button", { name: /save/i }))

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "destructive",
                title: "Error",
                description: "Database connection failed",
            })
        })
    })

    it("should show a confirmation dialog and delete a plan", async () => {
        mockExecute.mockResolvedValue({
            data: { message: "Plan deleted successfully" },
        })
        renderComponent({ plans: mockPlans })

        const deleteButtons = screen.getAllByRole("button", {
            name: /open menu/i,
        })
        await user.click(deleteButtons[1]) // Click menu for the second plan
        await user.click(screen.getByRole("menuitem", { name: /delete/i }))

        expect(
            await screen.findByRole("heading", {
                name: /are you sure you want to delete this plan/i,
            }),
        ).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: /continue/i }))

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({
                planId: mockPlans[1].planId,
            })
        })

        expect(mockToast).toHaveBeenCalledWith({
            variant: "default",
            title: "Success! 🎉",
            description: "Plan deleted successfully",
        })
    })
})
