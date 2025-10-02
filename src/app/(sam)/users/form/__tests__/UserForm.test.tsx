// import { saveUserAction } from "@/actions/saveUserAction"
import { UserForm } from "../UserForm"
import { useToast } from "@/hooks/use-toast"
import { type selectUserSchemaType } from "@/zod-schemas/user"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useAction } from "next-safe-action/hooks"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"

// Mock the server action to prevent server-only code from being executed
jest.mock("@/actions/saveUserAction", () => ({
    saveUserAction: jest.fn(),
}))

// Mock next/navigation
jest.mock("next/navigation", () => ({
    useSearchParams: jest.fn(),
    ReadonlyURLSearchParams: URLSearchParams,
    useRouter: () => ({
        back: jest.fn(),
    }),
}))

// Mock next-safe-action
jest.mock("next-safe-action/hooks", () => ({
    useAction: jest.fn(),
}))

// Mock useToast hook
jest.mock("@/hooks/use-toast", () => ({
    useToast: jest.fn(),
}))

const mockUseSearchParams = useSearchParams as jest.Mock
const mockUseAction = useAction as jest.Mock
const mockUseToast = useToast as jest.Mock

const mockExecute = jest.fn()
const mockReset = jest.fn()
const mockToast = jest.fn()

const mockUser: selectUserSchemaType = {
    userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
}

describe("UserForm", () => {
    beforeEach(() => {
        // Polyfill for target.hasPointerCapture
        if (!Element.prototype.hasPointerCapture) {
            Element.prototype.hasPointerCapture = () => false
        }
        // Polyfill for scrollIntoView
        if (!Element.prototype.scrollIntoView) {
            Element.prototype.scrollIntoView = jest.fn()
        }

        jest.clearAllMocks()
        mockUseAction.mockImplementation((_action, options) => ({
            executeAsync: jest.fn(async (...args) => {
                const result = await mockExecute(...args)
                if (result.data && options?.onSuccess) {
                    options.onSuccess({ data: result.data, status: 200 })
                }
            }),
            isPending: false,
            result: {},
            reset: mockReset,
        }))
        mockUseToast.mockReturnValue({ toast: mockToast })
    })

    const renderComponent = (
        props: { user?: selectUserSchemaType },
        searchParams: { [key: string]: string } = {},
    ) => {
        mockUseSearchParams.mockReturnValue(
            new ReadonlyURLSearchParams(new URLSearchParams(searchParams)),
        )
        return render(<UserForm {...props} />)
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
        mockUseAction.mockReturnValue({
            executeAsync: mockExecute,
            isPending: false,
            result: { serverError: "Unauthorized" },
            reset: mockReset,
        })
        renderComponent({ user: mockUser }, { userId: mockUser.userId })

        const alert = screen.getByRole("alert")
        expect(within(alert).getByText(/Unauthorized/)).toBeInTheDocument()
    })

    it("displays a toast notification on action error", async () => {
        const user = userEvent.setup()
        mockExecute.mockRejectedValueOnce(new Error("Server is down"))

        renderComponent({})

        await user.type(screen.getByLabelText(/Name/i), "Test")
        await user.type(screen.getByLabelText(/Email/i), "test@test.com")
        await user.click(screen.getByRole("button", { name: /Save/i }))

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "destructive",
                title: "Error",
                description: "Action error: Server is down",
            })
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
