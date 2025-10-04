import { setupMockFormHooks } from "@/app/__mocks__/mock-form-hooks"
import { getAgreementType } from "@/lib/queries/agreement"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AgreementRevisionForm } from "../AgreementRevisionForm"

// Mock the server action to prevent server-only code from being executed
jest.mock("@/actions/createAgreementRevisionAction", () => ({
    createAgreementRevisionAction: jest.fn(),
}))

const { mockExecute, mockReset, mockToast, mockRouterBack, mockUseAction } =
    setupMockFormHooks()

// Mock data
const mockAgreement: getAgreementType = {
    agreementId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    year: 2024,
    code: "AG-2024-001",
    revision: 1,
    isRevised: false,
    revisionDate: "2024-01-15",
    providerPlanId: "f49465d9-e640-4d75-8f12-5bced30216e2",
    localPlanId: "0ed67694-ac3a-4614-95af-f46ab45b3380",
    name: "Original Agreement Name",
    description: "Original agreement description.",
    contactEmail: "contact@example.com",
    comment: "Original comment.",
    documentUrl: "http://example.com/doc.pdf",
    localPlan: "LP01",
}

const mockPlans = [
    { id: "0ed67694-ac3a-4614-95af-f46ab45b3380", description: "LP01" },
    { id: "ce7f1c71-cbff-45ec-bf19-2262a9da743a", description: "LP02" },
    { id: "f49465d9-e640-4d75-8f12-5bced30216e2", description: "PP01" },
    { id: "29bd4205-ad71-4d14-95c2-228a11bc3f4f", description: "PP02" },
]

const mockServicesAmount = [
    {
        numberOfServices: 5,
        amount: "12500.50",
        currency: "USD" as const,
    },
    {
        numberOfServices: 2,
        amount: "8000.00",
        currency: "EUR" as const,
    },
]

describe("AgreementRevisionForm", () => {
    const renderComponent = (
        props: Partial<React.ComponentProps<typeof AgreementRevisionForm>> = {},
    ) => {
        return render(
            <AgreementRevisionForm
                agreement={mockAgreement}
                servicesCount={7}
                plans={mockPlans}
                servicesAmount={mockServicesAmount}
                {...props}
            />,
        )
    }

    it("should render the form with initial agreement data", () => {
        renderComponent()

        expect(
            screen.getByRole("heading", {
                name: /new agreement revision form/i,
            }),
        ).toBeInTheDocument()

        // Verify original agreement info is displayed
        expect(screen.getByText(/Year: 2024/)).toBeInTheDocument()
        expect(screen.getByText(/Code: AG-2024-001/)).toBeInTheDocument()
        expect(screen.getByText(/Local Plan: LP01/)).toBeInTheDocument()
        expect(screen.getByText("Original Agreement Name")).toBeInTheDocument()
        expect(
            screen.getByText(/Revision 1 on 2024-01-15 with 7 services/),
        ).toBeInTheDocument()

        // Verify services info
        expect(
            screen.getByText(/12.500,50 USD \(5 services\)/),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/8.000,00 EUR \(2 services\)/),
        ).toBeInTheDocument()

        // Verify form fields
        expect(screen.getByLabelText("Provider Plan")).toBeInTheDocument()
        expect(screen.getByLabelText("Local Plan")).toBeInTheDocument()
        expect(screen.getByLabelText("Revision Date")).toBeInTheDocument()
    })

    it("should show an error message if services amount is not provided", () => {
        render(
            <AgreementRevisionForm
                agreement={mockAgreement}
                servicesCount={7}
                plans={mockPlans}
                servicesAmount={undefined}
            />,
        )
        expect(
            screen.getByText("There are no services yet"),
        ).toBeInTheDocument()
    })

    it("should submit the form with correct data and show success toast", async () => {
        const user = userEvent.setup()
        const newRevisionId = "e73673ff-eb97-4447-8a64-e723863af377"
        mockExecute.mockResolvedValue({
            data: {
                agreementId: newRevisionId,
                message: "Revision created successfully.",
            },
        })

        const { rerender } = renderComponent()

        // Fill the form
        const providerPlanCombobox = screen.getByRole("combobox", {
            name: /provider plan/i,
        })
        await user.click(providerPlanCombobox)
        await user.click(await screen.findByRole("option", { name: "PP02" }))

        const localPlanCombobox = screen.getByRole("combobox", {
            name: /local plan/i,
        })
        await user.click(localPlanCombobox)
        await user.click(await screen.findByRole("option", { name: "LP02" }))

        const revisionDateInput = screen.getByLabelText("Revision Date")
        await user.clear(revisionDateInput)
        await user.type(revisionDateInput, "2025-02-20")

        // Submit the form
        await user.click(screen.getByRole("button", { name: /save/i }))

        // Assertions
        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({
                agreementId: mockAgreement.agreementId,
                providerPlanId: "29bd4205-ad71-4d14-95c2-228a11bc3f4f",
                localPlanId: "ce7f1c71-cbff-45ec-bf19-2262a9da743a",
                revisionDate: "2025-02-20",
            })
        })

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "default",
                title: "Success! 🎉",
                description: "Revision created successfully.",
            })
        })

        // Check for the link to the new agreement
        // We need to re-render the component with the updated result from the action
        // to see the conditionally rendered link.
        mockUseAction.mockReturnValueOnce({
            executeAsync: jest.fn(),
            isPending: false,
            result: {
                data: {
                    agreementId: newRevisionId,
                    message: "Revision created successfully.",
                },
            },
            reset: mockReset,
        })
        rerender(
            <AgreementRevisionForm
                agreement={mockAgreement}
                servicesCount={7}
                plans={mockPlans}
                servicesAmount={mockServicesAmount}
            />,
        )

        expect(
            await screen.findByText(/Success: Revision created successfully./),
        ).toBeInTheDocument()

        const link = await screen.findByRole("link", {
            name: /go to agreement form/i,
        })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
            "href",
            `/agreements/form?agreementId=${newRevisionId}`,
        )
    })

    it("should display validation errors for required fields", async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole("button", { name: /save/i }))

        expect(
            await screen.findByText(/provider plan is invalid/i),
        ).toBeInTheDocument()
        expect(
            await screen.findByText(/local plan is invalid/i),
        ).toBeInTheDocument()
        expect(mockExecute).not.toHaveBeenCalled()
    })

    it("should show an error toast on server-side action failure", async () => {
        const user = userEvent.setup()
        mockExecute.mockResolvedValue({
            serverError: "Failed to create revision",
        })

        renderComponent()

        // Fill the form
        await user.click(
            screen.getByRole("combobox", { name: /provider plan/i }),
        )
        await user.click(await screen.findByRole("option", { name: "PP02" }))

        await user.click(screen.getByRole("combobox", { name: /local plan/i }))
        await user.click(await screen.findByRole("option", { name: "LP02" }))

        // Submit
        await user.click(screen.getByRole("button", { name: /save/i }))

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "destructive",
                title: "Error",
                description: "Save Failed",
            })
        })
    })

    it("should call router.back() when Back button is clicked", async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole("button", { name: /back/i }))

        expect(mockRouterBack).toHaveBeenCalledTimes(1)
    })

    it("should reset the form to its default values when Reset button is clicked", async () => {
        const user = userEvent.setup()
        renderComponent()

        // Change form values
        await user.click(
            screen.getByRole("combobox", { name: /provider plan/i }),
        )
        await user.click(await screen.findByRole("option", { name: "PP02" }))

        const revisionDateInput = screen.getByLabelText("Revision Date")
        await user.clear(revisionDateInput)
        await user.type(revisionDateInput, "2025-12-31")

        // Verify changes
        const providerPlanSelect = screen.getByRole("combobox", {
            name: /provider plan/i,
        }) as HTMLButtonElement
        expect(providerPlanSelect).toHaveTextContent("PP02")
        expect(revisionDateInput).toHaveValue("2025-12-31")

        // Click Reset
        await user.click(screen.getByRole("button", { name: /reset/i }))

        // Verify form is reset
        expect(
            within(providerPlanSelect).getByText("Select"),
        ).toBeInTheDocument()
        expect(revisionDateInput).toHaveValue(
            new Date().toISOString().slice(0, 10),
        )
    })

    it("should display a success message from DisplayServerActionResponse", () => {
        mockUseAction.mockReturnValue({
            executeAsync: mockExecute,
            isPending: false,
            result: {
                data: {
                    message: "Revision successfully created.",
                },
            },
            reset: mockReset,
        })

        renderComponent()

        expect(
            screen.getByText(/Success: Revision successfully created./),
        ).toBeInTheDocument()
    })

    it("should display a server error message from DisplayServerActionResponse", () => {
        mockUseAction.mockReturnValue({
            executeAsync: mockExecute,
            isPending: false,
            result: {
                serverError: "Internal Server Error",
            },
            reset: mockReset,
        })

        renderComponent()

        expect(screen.getByText(/Internal Server Error/)).toBeInTheDocument()
    })

    it("should display validation errors from DisplayServerActionResponse", () => {
        mockUseAction.mockReturnValue({
            executeAsync: mockExecute,
            isPending: false,
            result: {
                validationErrors: {
                    providerPlanId: ["Provider plan is required"],
                    localPlanId: ["Local plan is required"],
                },
            },
            reset: mockReset,
        })

        renderComponent()

        expect(
            screen.getByText(/providerPlanId: Provider plan is required/),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/localPlanId: Local plan is required/),
        ).toBeInTheDocument()
    })
})
