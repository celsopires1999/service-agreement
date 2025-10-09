import { setupMockTableHooks } from "@/app/__mocks__/mock-table-hooks"
import type { getUserType } from "@/lib/queries/user"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserTable } from "../UserTable"

// Mock the server action to prevent server-only code from being executed
jest.mock("@/actions/deleteUserAction", () => ({
    deleteUserAction: jest.fn(),
}))

const { mockToast, mockRouterReplace, mockExecute } = setupMockTableHooks()

const mockUsers: getUserType[] = [
    {
        userId: "u1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        name: "Alice",
        email: "alice@example.com",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        userId: "u2b3c4d5-e6f7-8901-2345-67890abcdef",
        name: "Bob",
        email: "bob@example.com",
        role: "viewer",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
]

describe("UserTable", () => {
    const renderComponent = (data: getUserType[] = mockUsers) => {
        return render(<UserTable data={data} />)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("renders the table with user data correctly", () => {
        renderComponent()

        expect(
            screen.getByRole("heading", { name: "Users List" }),
        ).toBeInTheDocument()

        // Check for table headers
        expect(
            screen.getByRole("columnheader", { name: "User" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: "Email" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: "Role" }),
        ).toBeInTheDocument()

        // Check for table rows
        expect(screen.getByRole("cell", { name: "Alice" })).toBeInTheDocument()
        expect(screen.getByRole("cell", { name: "Bob" })).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "alice@example.com" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "bob@example.com" }),
        ).toBeInTheDocument()
    })

    it('renders "New User" button', () => {
        renderComponent()
        const addButton = screen.getByTestId("list-plus-icon")
        expect(addButton).toBeInTheDocument()
        expect(addButton.closest("a")).toHaveAttribute("href", "/users/form")
    })

    it("allows deleting a user and shows success toast", async () => {
        mockExecute.mockResolvedValue({
            data: { message: "User deleted successfully." },
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
                /this will permanently delete the user alice/i,
            ),
        ).toBeInTheDocument()

        const continueButton = within(confirmationDialog).getByRole("button", {
            name: "Continue",
        })
        await user.click(continueButton)

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({
                userId: mockUsers[0].userId,
            })
        })

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "default",
                title: "Success! 🎉",
                description: "User deleted successfully.",
            })
        })

        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    })

    it("shows an error toast when user deletion fails", async () => {
        mockExecute.mockResolvedValue({
            serverError: "Failed to delete user.",
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
                description: "Failed to delete user.",
            })
        })
    })

    it("navigates to the correct edit page when a row is clicked", async () => {
        renderComponent()

        const userLink = screen.getByRole("link", { name: "Alice" })
        expect(userLink).toBeInTheDocument()
        expect(userLink).toHaveAttribute(
            "href",
            `/users/form?userId=${mockUsers[0].userId}`,
        )
    })

    it("handles pagination correctly", async () => {
        const user = userEvent.setup()
        const manyUsers = Array.from({ length: 15 }, (_, i) => ({
            ...mockUsers[0],
            userId: `u${i}`,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
        }))
        renderComponent(manyUsers)

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
