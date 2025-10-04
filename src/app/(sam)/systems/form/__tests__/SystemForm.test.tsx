import { SystemForm } from "@/app/(sam)/systems/form/SystemForm"
import { setupMockFormHooks } from "@/app/__mocks__/mock-form-hooks"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReadonlyURLSearchParams } from "next/navigation"

// Mock the server action
jest.mock("@/actions/saveSystemAction", () => ({
    saveSystemAction: jest.fn(),
}))

const { mockExecute, mockToast, mockUseSearchParams } = setupMockFormHooks()

const mockSystem = {
    systemId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    name: "Legacy System",
    description: "An old but critical system.",
    applicationId: "APP-001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}

describe("SystemForm", () => {
    const user = userEvent.setup()

    const renderComponent = (
        props = {},
        searchParams: { [key: string]: string } = {},
    ) => {
        mockUseSearchParams.mockReturnValue(
            new ReadonlyURLSearchParams(new URLSearchParams(searchParams)),
        )
        render(<SystemForm {...props} />)
    }

    it("should render in 'New' mode without system data", () => {
        renderComponent()

        expect(
            screen.getByRole("heading", { name: /new system form/i }),
        ).toBeInTheDocument()
        expect(screen.getByLabelText(/name/i)).toHaveValue("")
        expect(screen.getByLabelText(/application id/i)).toHaveValue("")
        expect(screen.getByLabelText(/description/i)).toHaveValue("")
        expect(
            screen.queryByTestId("chevron-right-icon"),
        ).not.toBeInTheDocument()
    })

    it("should render in 'Edit' mode with pre-filled system data", () => {
        renderComponent(
            { system: mockSystem },
            { systemId: mockSystem.systemId },
        )

        expect(
            screen.getByRole("heading", { name: /edit system form/i }),
        ).toBeInTheDocument()
        expect(screen.getByLabelText(/name/i)).toHaveValue(mockSystem.name)
        expect(screen.getByLabelText(/application id/i)).toHaveValue(
            mockSystem.applicationId,
        )
        expect(screen.getByLabelText(/description/i)).toHaveValue(
            mockSystem.description,
        )
        expect(screen.getByTestId("chevron-right-icon")).toBeInTheDocument()
    })

    it("should display validation errors for required fields", async () => {
        renderComponent()

        await user.click(screen.getByRole("button", { name: /save/i }))

        expect(await screen.findByText("Name is required")).toBeInTheDocument()
        expect(
            await screen.findByText("Application ID is required"),
        ).toBeInTheDocument()
        expect(
            await screen.findByText("Description is required"),
        ).toBeInTheDocument()
        expect(mockExecute).not.toHaveBeenCalled()
    })

    it("should successfully create a new system", async () => {
        const newSystemData = {
            systemId: "(New)",
            name: "New Awesome System",
            applicationId: "APP-123",
            description: "A brand new system for testing.",
        }
        mockExecute.mockResolvedValue({
            data: {
                message: "System created successfully",
                systemId: "new-uuid-goes-here",
            },
        })
        renderComponent()

        await user.type(screen.getByLabelText(/name/i), newSystemData.name)
        await user.type(
            screen.getByLabelText(/application id/i),
            newSystemData.applicationId,
        )
        await user.type(
            screen.getByLabelText(/description/i),
            newSystemData.description,
        )
        await user.click(screen.getByRole("button", { name: /save/i }))

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith(newSystemData)
        })
        expect(mockToast).toHaveBeenCalledWith({
            variant: "default",
            title: "Success! 🎉",
            description: "System created successfully",
        })
        expect(
            screen.getByText(/success: system created successfully/i),
        ).toBeInTheDocument()
    })

    it("should successfully update an existing system", async () => {
        renderComponent(
            { system: mockSystem },
            { systemId: mockSystem.systemId },
        )

        const nameInput = screen.getByLabelText(/name/i)
        await user.clear(nameInput)
        await user.type(nameInput, "Updated System Name")

        await user.click(screen.getByRole("button", { name: /save/i }))

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({
                systemId: mockSystem.systemId,
                name: "Updated System Name",
                applicationId: mockSystem.applicationId,
                description: mockSystem.description,
            })
        })
    })

    it("should display a server error toast and message on failure", async () => {
        mockExecute.mockResolvedValue({
            serverError: "Database connection failed",
        })
        renderComponent()

        await user.type(screen.getByLabelText(/name/i), "Test System")
        await user.type(screen.getByLabelText(/application id/i), "TS-01")
        await user.type(
            screen.getByLabelText(/description/i),
            "Test description",
        )
        await user.click(screen.getByRole("button", { name: /save/i }))

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "destructive",
                title: "Error",
                description: "Database connection failed",
            })
        })
        expect(
            screen.getByText(/database connection failed/i),
        ).toBeInTheDocument()
    })

    it("should reset the form to its default values when reset button is clicked", async () => {
        renderComponent(
            { system: mockSystem },
            { systemId: mockSystem.systemId },
        )

        const nameInput = screen.getByLabelText(/name/i)
        await user.clear(nameInput)
        await user.type(nameInput, "A temporary name")

        expect(nameInput).toHaveValue("A temporary name")

        await user.click(screen.getByRole("button", { name: /reset/i }))

        expect(nameInput).toHaveValue(mockSystem.name)
    })
})
