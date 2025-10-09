import { setupMockTableHooks } from "@/app/__mocks__/mock-table-hooks"
import type { getSystemType } from "@/lib/queries/system"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SystemTable } from "../SystemTable"

// Mock the server action to prevent server-only code from being executed
jest.mock("@/actions/deleteSystemAction", () => ({
    deleteSystemAction: jest.fn(),
}))

const { mockToast, mockRouterReplace, mockExecute } = setupMockTableHooks()

const mockData: getSystemType[] = [
    {
        systemId: "sys-1",
        name: "System One",
        applicationId: "APP-001",
        description: "Description for system one",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        systemId: "sys-2",
        name: "System Two",
        applicationId: "APP-002",
        description: "Description for system two",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
]

describe("SystemTable", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render the table with system data", () => {
        render(<SystemTable data={mockData} />)

        expect(
            screen.getByRole("heading", { name: "Systems List" }),
        ).toBeInTheDocument()
        expect(screen.getByText("System One")).toBeInTheDocument()
        expect(screen.getByText("APP-001")).toBeInTheDocument()
        expect(screen.getByText("System Two")).toBeInTheDocument()
        expect(screen.getByText("APP-002")).toBeInTheDocument()
    })

    it("should render links for each system row", () => {
        render(<SystemTable data={mockData} />)

        const link = screen.getByText("System One").closest("a")
        expect(link).toHaveAttribute("href", "/systems/form?systemId=sys-1")
    })

    it("should handle pagination correctly", async () => {
        const user = userEvent.setup()
        const longData = Array.from({ length: 15 }, (_, i) => ({
            ...mockData[0],
            systemId: `sys-${i + 1}`,
            name: `System ${i + 1}`,
        }))
        render(<SystemTable data={longData} />)
        expect(
            screen.getByText(/page 1 of 2 \[15 total results\]/i),
        ).toBeInTheDocument()
        expect(screen.getByText("Previous")).toBeDisabled()
        expect(screen.getByText("Next")).toBeEnabled()

        await user.click(screen.getByText("Next"))

        expect(mockRouterReplace).toHaveBeenCalledWith("?page=2", {
            scroll: false,
        })
    })

    it("should open delete confirmation dialog when delete is clicked", async () => {
        const user = userEvent.setup()
        render(<SystemTable data={mockData} />)

        const dropdowns = screen.getAllByText(/open menu/i)

        await user.click(dropdowns[0])

        const deleteButton = await screen.findByText("Delete")
        await user.click(deleteButton)

        expect(
            await screen.findByText(
                "Are you sure you want to delete this System?",
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                "This action cannot be undone. This will permanently delete the system System One.",
            ),
        ).toBeInTheDocument()
    })

    it("should call delete action and show success toast on confirmation", async () => {
        mockExecute.mockResolvedValue({
            data: { message: "System deleted successfully" },
        })
        const user = userEvent.setup()
        render(<SystemTable data={mockData} />)

        // Open delete confirmation
        const dropdowns = screen.getAllByText(/open menu/i)
        await user.click(dropdowns[0])
        const deleteButton = await screen.findByText("Delete")
        await user.click(deleteButton)

        const confirmButton = await screen.findByRole("button", {
            name: "Continue",
        })
        await user.click(confirmButton)

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({ systemId: "sys-1" })
        })

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "default",
                title: "Success! 🎉",
                description: "System deleted successfully",
            })
        })

        expect(
            screen.queryByText("Are you sure you want to delete this System?"),
        ).not.toBeInTheDocument()
    })
})
