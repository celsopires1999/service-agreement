import { SystemsToServiceForm } from "@/app/(sam)/services/[serviceId]/SystemsToServiceForm"
import { setupMockFormHooks } from "@/app/__mocks__/mock-form-hooks"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Mock server actions
jest.mock("@/actions/saveServiceSystemsAction", () => ({
    saveServiceSystemsAction: jest.fn(),
}))
jest.mock("@/actions/deleteServiceSystemAction", () => ({
    deleteServiceSystemAction: jest.fn(),
}))

const { mockExecute, mockToast } = setupMockFormHooks()

const mockService = {
    serviceId: "ac27a25d-cbdd-4bbc-ac29-7dd92c58ea6f",
    agreementId: "29d77a39-b112-4f62-902f-e02079305182",
    name: "Test Service",
    description: "A service for testing purposes.",
    runAmount: "800.00",
    chgAmount: "200.00",
    amount: "1000.00",
    currency: "USD" as const,
    responsibleEmail: "resp@test.com",
    providerAllocation: "Test Provider Allocation",
    localAllocation: "Test Local Allocation",
    isActive: false,
    status: "created" as const,
    validatorEmail: "validator@test.com",
    documentUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
}

const mockAgreement = {
    agreementId: "c0897ce4-36f1-4693-a358-255f75fe2c33",
    year: 2024,
    code: "AG-2024",
    revision: 1,
    isRevised: false,
    revisionDate: "2024-01-01",
    providerPlanId: "5588a363-a6f0-444d-9b3c-083801671094",
    localPlanId: "e0c9ad79-7115-4032-b91d-7980c3193a25",
    name: "Test Agreement",
    description: "An agreement for testing.",
    contactEmail: "contact@test.com",
    comment: null,
    localPlan: "LP-01",
    documentUrl: null,
}

const mockSystems = [
    {
        id: "28f860b5-e58c-4ce8-8d90-dc125efef2bc",
        description: "System Alpha",
    },
    {
        id: "76928254-cb08-4540-baa7-68a69c628f78",
        description: "System Beta",
    },
]

const mockServiceSystems = [
    {
        serviceId: mockService.serviceId,
        systemId: mockSystems[0].id,
        name: "System Alpha",
        description: "The first test system.",
        allocation: "50.000000",
        amount: "500.00",
        currency: "USD" as const,
    },
]

describe("SystemsToServiceForm", () => {
    const user = userEvent.setup()

    const renderComponent = (props = {}) => {
        render(
            <SystemsToServiceForm
                service={mockService}
                agreement={mockAgreement}
                systems={mockSystems}
                serviceSystems={mockServiceSystems}
                isEditable={true}
                {...props}
            />,
        )
    }

    it("should render the form and table in editable mode", () => {
        renderComponent()

        expect(
            screen.getByRole("heading", { name: /cost allocation/i }),
        ).toBeInTheDocument()

        expect(screen.getByText(/select/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/allocation/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /save/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "System Alpha" }),
        ).toBeInTheDocument()
    })

    it("should not render the allocation form in view-only mode", () => {
        renderComponent({ isEditable: false })

        expect(
            screen.queryByRole("button", { name: /save/i }),
        ).not.toBeInTheDocument()
        expect(screen.queryByLabelText(/system/i)).not.toBeInTheDocument()
    })

    it("should display validation errors for required fields", async () => {
        renderComponent({ serviceSystems: [] })

        await user.click(screen.getByRole("button", { name: /save/i }))

        expect(
            await screen.findByText("invalid UUID", { exact: false }),
        ).toBeInTheDocument()
        expect(
            await screen.findByText("Invalid allocation", { exact: false }),
        ).toBeInTheDocument()
        expect(mockExecute).not.toHaveBeenCalled()
    })

    it("should automatically calculate allocation when amount is entered", async () => {
        renderComponent()

        await user.click(
            screen.getByRole("textbox", {
                name: /amount/i,
            }),
        )

        const amountInput = screen.getByRole("spinbutton", {
            name: /amount/i,
        })

        await user.type(amountInput, "250.00")
        await user.tab()

        expect(amountInput).toHaveValue(250)
        expect(amountInput).toHaveDisplayValue("250")
        // There are two controls for amount
        expect(screen.getByRole("textbox", { name: /amount/i })).toHaveValue(
            "250,00",
        )

        const allocationInput = screen.getByRole("spinbutton", {
            name: /allocation/i,
        })

        await user.click(screen.getByRole("button", { name: /save/i }))

        expect(allocationInput).toHaveValue(25)
        expect(allocationInput).toHaveDisplayValue("25.000000")
    })

    it("should successfully save a new system allocation", async () => {
        mockExecute.mockResolvedValue({
            data: { message: "Allocation saved successfully" },
        })
        renderComponent()

        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByText("System Beta"))

        const allocationInput = screen.getByLabelText(/allocation/i)
        await user.type(allocationInput, "30")
        await user.click(screen.getByRole("button", { name: /save/i }))

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({
                serviceId: mockService.serviceId,
                systemId: mockSystems[1].id,
                allocation: "30",
            })
        })

        expect(mockToast).toHaveBeenCalledWith({
            variant: "default",
            title: "Success! 🎉",
            description: "Allocation saved successfully",
        })
    })

    it("should display a server error on save failure", async () => {
        mockExecute.mockResolvedValue({
            serverError: "Database connection failed",
        })
        renderComponent()

        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByText("System Beta"))

        await user.type(screen.getByLabelText(/allocation/i), "100")
        await user.click(screen.getByRole("button", { name: /save/i }))

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalled()
        })

        expect(mockToast).toHaveBeenCalledWith({
            variant: "destructive",
            title: "Error",
            description: "Save Failed",
        })
    })

    it("should populate the form for editing when an item's edit button is clicked", async () => {
        renderComponent()

        const systemInput = screen.getByRole("combobox")
        const allocationInput = screen.getByLabelText(/allocation/i)

        expect(systemInput).toHaveTextContent("Select")

        expect(allocationInput).toHaveValue(null)

        const rowMenuButton = screen.getByRole("button", { name: /open menu/i })
        await user.click(rowMenuButton)

        // There are two "Edit" menu items. One is a link, the other a button-like div.
        // We want the one that is not a link to populate the form.
        const editMenuItems = screen.getAllByRole("menuitem", { name: /edit/i })
        const editButton = editMenuItems.find((item) => item.tagName !== "A")
        await user.click(editButton!)

        expect(systemInput).toHaveTextContent("System Alpha")
        expect(allocationInput).toHaveValue(50)
        expect(allocationInput).toHaveDisplayValue("50.000000")
    })
})
