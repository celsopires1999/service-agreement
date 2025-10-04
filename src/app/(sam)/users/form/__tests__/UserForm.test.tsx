import { setupMockFormHooks } from "@/app/__mocks__/mock-form-hooks"
import { type selectUserSchemaType } from "@/zod-schemas/user"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReadonlyURLSearchParams } from "next/navigation"
import { UserForm } from "../UserForm"

// Mock the server action to prevent server-only code from being executed
jest.mock("@/actions/saveUserAction", () => ({
    saveUserAction: jest.fn(),
}))

const {
    mockExecute,
    mockReset,
    mockToast,
    mockUseAction,
    mockUseSearchParams,
} = setupMockFormHooks()

// Mock data
const mockUser: selectUserSchemaType = {
    userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
}

describe("UserForm", () => {
    const renderComponent = (
        props: { user?: selectUserSchemaType },
        searchParams: { [key: string]: string } = {},
    ) => {
        mockUseSearchParams.mockReturnValue(
            new ReadonlyURLSearchParams(new URLSearchParams(searchParams)),
        )
        // Re-render with the updated result to simulate the hook's state change
        const { rerender, ...rest } = render(<UserForm {...props} />)
        return {
            ...rest,
            rerender: (newProps?: { user?: selectUserSchemaType }) =>
                rerender(<UserForm {...(newProps || props)} />),
        }
    }

    it("renders the form for a new user correctly", async () => {
        renderComponent({})

        expect(
            screen.getByRole("heading", { name: /New User Form/i }),
        ).toBeInTheDocument()
        expect(screen.getByLabelText(/Name/i)).toHaveValue("")
        expect(screen.getByLabelText(/Email/i)).toHaveValue("")
        expect(
            screen.getByRole("combobox", { name: /Role/i }),
        ).toHaveTextContent("viewer")
    })

    it("renders the form for an existing user with pre-filled data", () => {
        renderComponent({ user: mockUser }, { userId: mockUser.userId })

        expect(
            screen.getByRole("heading", { name: /Edit User Form/i }),
        ).toBeInTheDocument()
        expect(screen.getByLabelText(/Name/i)).toHaveValue(mockUser.name)
        expect(screen.getByLabelText(/Email/i)).toHaveValue(mockUser.email)
        expect(
            screen.getByRole("combobox", { name: /Role/i }),
        ).toHaveTextContent(mockUser.role)
    })

    it("shows validation errors for invalid input", async () => {
        const user = userEvent.setup()
        renderComponent({})

        await user.click(screen.getByRole("button", { name: /Save/i }))

        expect(await screen.findByText(/Name is required/i)).toBeInTheDocument()
        expect(
            await screen.findByText(/Email is required/i),
        ).toBeInTheDocument()

        await user.type(screen.getByLabelText(/Email/i), "invalid-email")
        await user.click(screen.getByLabelText(/Name/i)) // Trigger onBlur

        expect(await screen.findByText(/Invalid email/i)).toBeInTheDocument()
    })

    it("submits the form and calls the save action on success", async () => {
        const user = userEvent.setup()
        mockExecute.mockResolvedValueOnce({
            data: { message: "User created successfully" },
        })
        renderComponent({})

        await user.type(screen.getByLabelText(/Name/i), "Jane Doe")
        await user.type(screen.getByLabelText(/Email/i), "jane.doe@example.com")
        await user.click(screen.getByRole("combobox", { name: /Role/i }))
        await user.click(screen.getByRole("option", { name: "validator" }))
        await user.click(screen.getByRole("button", { name: /Save/i }))

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({
                userId: "(New)",
                name: "Jane Doe",
                email: "jane.doe@example.com",
                role: "validator",
            })
        })

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "default",
                title: "Success! 🎉",
                description: "User created successfully",
            })
        })
    })

    it("displays a server error message when the action fails", async () => {
        const user = userEvent.setup()
        mockExecute.mockResolvedValue({ serverError: "Unauthorized" })

        const { rerender } = renderComponent(
            { user: mockUser },
            { userId: mockUser.userId },
        )

        // Modify a field and save to trigger the action
        await user.clear(screen.getByLabelText(/Name/i))
        await user.type(screen.getByLabelText(/Name/i), "New Name")
        await user.click(screen.getByRole("button", { name: /Save/i }))

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "destructive",
                title: "Error",
                description: "Unauthorized",
            })
        })

        // Rerender to reflect the updated `result` from the action
        rerender()

        await waitFor(() => {
            expect(screen.getByText(/Unauthorized/i)).toBeInTheDocument()
        })
    })

    it("disables the save button while the action is pending", () => {
        mockUseAction.mockReturnValue({
            executeAsync: mockExecute,
            isPending: true,
            result: {},
            reset: mockReset,
        })
        renderComponent({})

        const saveButton = screen.getByRole("button", { name: /Saving/i })
        expect(saveButton).toBeDisabled()
        expect(screen.getByTestId("loader-circle-icon")).toBeInTheDocument()
    })

    it("resets the form to its default values when the reset button is clicked", async () => {
        const user = userEvent.setup()
        renderComponent({ user: mockUser }, { userId: mockUser.userId })

        const nameInput = screen.getByLabelText(/Name/i)
        const emailInput = screen.getByLabelText(/Email/i)

        await user.clear(nameInput)
        await user.type(nameInput, "A new name")
        await user.clear(emailInput)
        await user.type(emailInput, "new@email.com")

        expect(nameInput).toHaveValue("A new name")
        expect(emailInput).toHaveValue("new@email.com")

        await user.click(screen.getByRole("button", { name: /Reset/i }))

        expect(nameInput).toHaveValue(mockUser.name)
        expect(emailInput).toHaveValue(mockUser.email)
        expect(mockReset).toHaveBeenCalled()
    })
})
