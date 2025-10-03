import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ServiceForm } from "@/app/(sam)/services/form/ServiceForm"
import { setupMockFormHooks } from "@/app/__mocks__/mock-form-hooks"
import { getAgreementType } from "@/lib/queries/agreement"
import { selectServiceSchemaType } from "@/zod-schemas/service"

// Mock the server action to prevent server-only code from being executed
jest.mock("@/actions/saveServiceAction", () => ({
    saveServiceAction: jest.fn(),
}))

// Mock data
const mockAgreement: getAgreementType = {
    agreementId: "c3ad8b83-0653-4788-9a59-1af693030065",
    year: 2024,
    code: "AGR-001",
    revision: 1,
    isRevised: false,
    revisionDate: "2024-01-01",
    providerPlanId: "80baed5f-c7fc-41eb-81b4-f552fc9e84e7",
    localPlanId: "2a1eaedc-8fe4-45a4-a569-7a5253c40acf",
    name: "Test Agreement",
    description: "An agreement for testing purposes.",
    contactEmail: "contact@test.com",
    comment: "No comment",
    localPlan: "LP-2024",
    documentUrl: "https://example.com/doc",
}

const mockService: selectServiceSchemaType = {
    serviceId: "69f1f181-44d9-4179-b937-515d7ebfe543",
    agreementId: "e4cdfbd6-25a8-45ee-8d23-845826abca4a",
    name: "Test Service",
    description: "A service for testing.",
    runAmount: "1000.00",
    chgAmount: "500.00",
    amount: "1500.00",
    currency: "USD",
    responsibleEmail: "resp@test.com",
    isActive: false,
    providerAllocation: "Provider details",
    localAllocation: "Local details",
    status: "created",
    validatorEmail: "validator@test.com",
    documentUrl: "https://example.com/service-doc",
    createdAt: new Date(),
    updatedAt: new Date(),
}

const mockCurrencies = [
    { id: "USD", description: "USD" },
    { id: "EUR", description: "EUR" },
]

// Centralized mock setup
const { mockExecute, mockRouterBack, mockToast } = setupMockFormHooks()

const renderComponent = (
    props: Partial<React.ComponentProps<typeof ServiceForm>> = {},
) => {
    const defaultProps = {
        agreement: mockAgreement,
        currencies: mockCurrencies,
        isEditable: true,
    }
    return render(<ServiceForm {...defaultProps} {...props} />)
}

describe("ServiceForm", () => {
    it("renders in 'New' mode with correct title and fields", () => {
        renderComponent()

        expect(
            screen.getByRole("heading", { name: /New Service Form/i }),
        ).toBeInTheDocument()
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument()

        expect(screen.getByLabelText(/Run Amount/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Change Amount/i)).toBeInTheDocument()
        expect(screen.queryByLabelText(/Status/i)).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
    })

    it("renders in 'Edit' mode with pre-filled data", () => {
        renderComponent({ service: mockService })

        expect(
            screen.getByRole("heading", { name: /Edit Service Form/i }),
        ).toBeInTheDocument()
        expect(screen.getByLabelText(/Name/i)).toHaveValue(mockService.name)
        expect(screen.getByLabelText(/Run Amount/i)).toHaveValue("1.000,00")
        expect(screen.getByLabelText(/Change Amount/i)).toHaveValue("500,00")

        expect(
            screen.getByRole("combobox", { name: /status/i }),
        ).toHaveTextContent(/created/i)
        expect(screen.getByLabelText(/Validator Email/i)).toHaveValue(
            mockService.validatorEmail,
        )
    })

    it("renders in 'View' mode with disabled fields", () => {
        renderComponent({ service: mockService, isEditable: false })

        expect(
            screen.getByRole("heading", { name: /View Service Form/i }),
        ).toBeInTheDocument()
        expect(screen.getByLabelText(/Name/i)).toBeDisabled()
        expect(screen.getByLabelText(/Run Amount/i)).toBeDisabled()
        expect(screen.getByLabelText(/Change Amount/i)).toBeDisabled()
        expect(screen.getByLabelText(/Status/i)).toBeDisabled()
        expect(
            screen.queryByRole("button", { name: "Save" }),
        ).not.toBeInTheDocument()
    })

    it("displays validation errors for required fields", async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole("button", { name: "Save" }))

        expect(await screen.findByText("Name is required")).toBeInTheDocument()
        expect(
            await screen.findByText("Invalid run amount"),
        ).toBeInTheDocument()
        expect(
            await screen.findByText("Invalid change amount"),
        ).toBeInTheDocument()
        expect(
            await screen.findByText("Invalid responsible email address"),
        ).toBeInTheDocument()
        expect(
            await screen.findByText("Provider Allocation is required"),
        ).toBeInTheDocument()
        expect(
            await screen.findByText("Local Allocation is required"),
        ).toBeInTheDocument()
        expect(
            await screen.findByText("Invalid validator email address"),
        ).toBeInTheDocument()
    })

    it("submits the form successfully and shows a success toast", async () => {
        const user = userEvent.setup()
        mockExecute.mockResolvedValueOnce({
            data: {
                message: "Service created successfully",
                serviceId: "new-svc-id",
            },
        })
        renderComponent()

        await user.type(screen.getByLabelText(/Name/i), "New Awesome Service")

        const runAmountInput = screen.getByLabelText(/Run Amount/i)
        await user.click(runAmountInput) // Switch to edit mode
        await user.type(screen.getByLabelText(/Run Amount/i), "2000")
        await user.click(screen.getByLabelText(/Change Amount/i)) // Switch to edit mode
        await user.type(screen.getByLabelText(/Change Amount/i), "100")
        await user.type(
            screen.getByLabelText(/Responsible Email/i),
            "new@test.com",
        )
        await user.type(
            screen.getByLabelText("Description"),
            "New service description",
        )
        await user.type(
            screen.getByLabelText(/Provider Allocation/i),
            "New provider allocation",
        )
        await user.type(
            screen.getByLabelText(/Local Allocation/i),
            "New local allocation",
        )
        await user.type(
            screen.getByLabelText(/Validator Email/i),
            "new.validator@test.com",
        )

        await user.click(screen.getByRole("button", { name: "Save" }))

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "New Awesome Service",
                    runAmount: "2000",
                    chgAmount: "100",
                    responsibleEmail: "new@test.com",
                }),
            )
        })

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "default",
                title: "Success! 🎉",
                description: "Service created successfully",
            })
        })
    })

    it("shows a server error toast on submission failure", async () => {
        const user = userEvent.setup()
        mockExecute.mockResolvedValueOnce({
            serverError: "Failed to save service",
        })
        renderComponent({ service: mockService })

        await user.clear(screen.getByLabelText(/Name/i))
        await user.type(screen.getByLabelText(/Name/i), "Updated Service Name")
        await user.click(screen.getByRole("button", { name: "Save" }))
        screen.logTestingPlaygroundURL()
        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalled()
        })

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "destructive",
                title: "Error",
                description: "Save Failed",
            })
        })
    })

    it("resets the form to default values when 'Reset' is clicked", async () => {
        const user = userEvent.setup()
        renderComponent({ service: mockService })

        const nameInput = screen.getByLabelText(/Name/i)
        await user.clear(nameInput)
        await user.type(nameInput, "A temporary change")
        expect(nameInput).toHaveValue("A temporary change")

        await user.click(screen.getByRole("button", { name: "Reset" }))

        expect(nameInput).toHaveValue(mockService.name)
        expect(screen.getByLabelText(/Run Amount/i)).toHaveValue("1.000,00")
    })

    it("navigates back when 'Back' button is clicked", async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole("button", { name: "Back" }))

        expect(mockRouterBack).toHaveBeenCalledTimes(1)
    })

    it("displays an inactive allocation badge when service is present but not active", () => {
        renderComponent({ service: { ...mockService, isActive: false } })
        const badge = screen.getByText("Allocation")
        expect(badge).toBeInTheDocument()
        expect(badge).toHaveClass(
            "border-transparent bg-destructive text-destructive-foreground",
        )
    })

    it("displays an active allocation badge when service is present and active", () => {
        renderComponent({ service: { ...mockService, isActive: true } })
        const badge = screen.getByText("Allocation")
        expect(badge).toBeInTheDocument()
        expect(badge).toHaveClass(
            "border-transparent bg-primary text-primary-foreground",
        )
    })
})
