import { UserFormView } from "@/app/(sam)/users/form/UserFormView"
import { insertUserSchemaType, selectUserSchemaType } from "@/zod-schemas/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm, UseFormReturn } from "react-hook-form"
import { z } from "zod"

// Mock next/navigation
const mockRouterBack = jest.fn()
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        back: mockRouterBack,
    }),
}))

// Mock the zod schema to use in the test form
const testSchema = z.object({
    userId: z.string(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    role: z.enum(["admin", "viewer", "validator"]),
})

type TestFormValues = z.infer<typeof testSchema>

// Helper component to initialize react-hook-form
const TestWrapper = ({
    children,
    defaultValues,
}: {
    children: (form: UseFormReturn<TestFormValues>) => React.ReactNode
    defaultValues: TestFormValues
}) => {
    const form = useForm<TestFormValues>({
        resolver: zodResolver(testSchema),
        defaultValues,
        mode: "onBlur",
    })
    return <>{children(form)}</>
}

const mockUser: selectUserSchemaType = {
    userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
}

const mockEmptyUser: insertUserSchemaType = {
    userId: "(New)",
    name: "",
    email: "",
    role: "viewer",
}

describe("UserFormView", () => {
    const mockSubmitForm = jest.fn()
    const mockResetForm = jest.fn()

    beforeEach(() => {
        // Mock for Radix UI Select component in JSDOM
        // https://github.com/testing-library/user-event/issues/1069
        // @ts-ignore
        global.HTMLElement.prototype.hasPointerCapture = jest.fn()
        // Mock for Radix UI Select component in JSDOM
        window.HTMLElement.prototype.scrollIntoView = jest.fn()
        jest.clearAllMocks()
    })

    const renderComponent = (
        props: Partial<React.ComponentProps<typeof UserFormView>>,
        defaultValues: TestFormValues = mockEmptyUser,
    ) => {
        const baseProps = {
            submitForm: mockSubmitForm,
            resetForm: mockResetForm,
            isSaving: false,
            saveResult: {},
            ...props,
        }

        return render(
            <TestWrapper defaultValues={defaultValues}>
                {(form) => <UserFormView {...baseProps} form={form as any} />}
            </TestWrapper>,
        )
    }

    it("should render the form for a new user", () => {
        renderComponent({})
        expect(
            screen.getByRole("heading", { name: /new user form/i }),
        ).toBeInTheDocument()
        expect(screen.getByLabelText(/name/i)).toHaveValue("")
        expect(screen.getByLabelText(/email/i)).toHaveValue("")
        expect(
            screen.getByRole("combobox", { name: /role/i }),
        ).toHaveTextContent("viewer")
    })

    it("should render the form for an existing user with pre-filled data", () => {
        renderComponent({ user: mockUser }, mockUser)
        expect(
            screen.getByRole("heading", { name: /edit user form/i }),
        ).toBeInTheDocument()
        expect(screen.getByLabelText(/name/i)).toHaveValue(mockUser.name)
        expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email)
        expect(
            screen.getByRole("combobox", { name: /role/i }),
        ).toHaveTextContent(mockUser.role)
    })

    it("should allow user to fill out the form", async () => {
        const user = userEvent.setup()
        renderComponent({})

        const nameInput = screen.getByLabelText(/name/i)
        const emailInput = screen.getByLabelText(/email/i)
        const roleSelect = screen.getByRole("combobox", { name: /role/i })

        await user.type(nameInput, "Jane Doe")
        await user.type(emailInput, "jane.doe@test.com")
        await user.click(roleSelect)
        await user.click(screen.getByRole("option", { name: "admin" }))

        expect(nameInput).toHaveValue("Jane Doe")
        expect(emailInput).toHaveValue("jane.doe@test.com")
        expect(roleSelect).toHaveTextContent("admin")
    })

    it("should call submitForm with form data on save", async () => {
        const user = userEvent.setup()
        renderComponent({ user: mockUser }, mockUser)

        const nameInput = screen.getByLabelText(/name/i)
        await user.clear(nameInput)
        await user.type(nameInput, "Updated Name")

        await user.click(screen.getByRole("button", { name: /save/i }))

        await waitFor(() => {
            expect(mockSubmitForm).toHaveBeenCalledWith(
                {
                    name: "Updated Name",
                    email: mockUser.email,
                    role: mockUser.role,
                    userId: mockUser.userId,
                },
                expect.any(Object), // For the form event object
            )
        })
    })

    it("should display saving state when isSaving is true", () => {
        renderComponent({ isSaving: true })
        const saveButton = screen.getByRole("button", { name: /saving/i })
        expect(saveButton).toBeDisabled()
        expect(screen.getByTestId("loader-circle-icon")).toBeInTheDocument()
    })

    it("should call resetForm when reset button is clicked", async () => {
        const user = userEvent.setup()
        renderComponent({})
        await user.click(screen.getByRole("button", { name: /reset/i }))
        expect(mockResetForm).toHaveBeenCalledTimes(1)
    })

    it("should call router.back when back button is clicked", async () => {
        const user = userEvent.setup()
        renderComponent({})
        await user.click(screen.getByRole("button", { name: /back/i }))
        expect(mockRouterBack).toHaveBeenCalledTimes(1)
    })

    it("should display a success message when saveResult has data", () => {
        renderComponent({
            saveResult: { data: { message: "User saved successfully!" } },
        })
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Success: User saved successfully!",
        )
    })

    it("should display a server error message when saveResult has serverError", () => {
        renderComponent({
            saveResult: { serverError: "Something went wrong on the server." },
        })
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Something went wrong on the server.",
        )
    })

    it("should display validation errors when saveResult has validationErrors", () => {
        renderComponent({
            saveResult: {
                validationErrors: { email: ["Invalid email format"] },
            },
        })
        expect(screen.getByRole("alert")).toHaveTextContent(
            "email: Invalid email format",
        )
    })
})
