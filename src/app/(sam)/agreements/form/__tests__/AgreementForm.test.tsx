import { setupMockFormHooks } from "@/app/__mocks__/mock-form-hooks"
import { getAgreementType } from "@/lib/queries/agreement"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReadonlyURLSearchParams } from "next/navigation"
import { AgreementForm } from "../AgreementForm"

// Mock the server action to prevent server-only code from being executed
jest.mock("@/actions/saveAgreementAction", () => ({
    saveAgreementAction: jest.fn(),
}))

const { mockExecute, mockToast, mockUseAction, mockUseSearchParams } =
    setupMockFormHooks()

// Mock data
const mockAgreement: getAgreementType = {
    agreementId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    year: 2024,
    code: "AG-2024-001",
    revision: 1,
    isRevised: false,
    revisionDate: "15/01/2024",
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

describe("AgreementForm", () => {
    const renderComponent = (
        props: Partial<React.ComponentProps<typeof AgreementForm>>,
        searchParams: { [key: string]: string } = {},
    ) => {
        mockUseSearchParams.mockReturnValue(
            new ReadonlyURLSearchParams(new URLSearchParams(searchParams)),
        )
        const { rerender, ...rest } = render(
            <AgreementForm
                plans={mockPlans}
                servicesAmount={mockServicesAmount}
                {...props}
            />,
        )
        return { rerender, ...rest }
    }

    describe("Rendering and Initial State", () => {
        it("should render in 'new' mode correctly", () => {
            renderComponent({})

            expect(
                screen.getByRole("heading", { name: /new agreement form/i }),
            ).toBeInTheDocument()
            expect(screen.getByLabelText(/Year/i)).toHaveValue(
                new Date().getFullYear(),
            )
            expect(screen.getByLabelText(/Code/i)).toHaveValue("")
            expect(screen.getByLabelText(/Name/i)).toHaveValue("")
            expect(screen.getByLabelText(/^Revision$/i)).toBeDisabled()
            expect(
                screen.queryByLabelText(/Revised\?/i),
            ).not.toBeInTheDocument()
        })

        it("should render in edit mode with pre-filled data", () => {
            renderComponent(
                { agreement: mockAgreement },
                { agreementId: mockAgreement.agreementId },
            )

            expect(
                screen.getByRole("heading", { name: /edit agreement form/i }),
            ).toBeInTheDocument()
            expect(screen.getByLabelText(/Year/i)).toBeDisabled()
            expect(screen.getByLabelText(/Year/i)).toHaveValue(
                mockAgreement.year,
            )
            expect(screen.getByLabelText(/Name/i)).toHaveValue(
                mockAgreement.name,
            )
            expect(screen.getByLabelText(/Description/i)).toHaveValue(
                mockAgreement.description,
            )
            expect(screen.getByLabelText(/Revised\?/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/Revised\?/i)).not.toBeChecked()
        })
    })

    describe("User Interactions and Validation", () => {
        it("should display validation errors if required fields are empty on submit", async () => {
            const user = userEvent.setup()
            renderComponent({})

            await user.click(screen.getByRole("button", { name: /Save/i }))

            expect(
                await screen.findByText(/Code is required/i),
            ).toBeInTheDocument()
            expect(
                await screen.findByText(/Name is required/i),
            ).toBeInTheDocument()
            const invalidUuidErrors =
                await screen.findAllByText(/invalid UUID/i)
            expect(invalidUuidErrors).toHaveLength(2) // For comboboxes
            expect(mockExecute).not.toHaveBeenCalled()
        })

        it("should allow user to type in form fields", async () => {
            const user = userEvent.setup()
            renderComponent({})

            const nameInput = screen.getByLabelText(/Name/i)
            await user.type(nameInput, "Test Agreement")
            expect(nameInput).toHaveValue("Test Agreement")

            const descriptionInput = screen.getByLabelText(/Description/i)
            await user.type(descriptionInput, "Test Description")
            expect(descriptionInput).toHaveValue("Test Description")
        })
    })

    describe("Form Submission and Action Handling", () => {
        it("should call save action with form data on successful creation", async () => {
            const user = userEvent.setup()
            const newAgreementId = "new-agreement-id"
            mockExecute.mockResolvedValue({
                data: {
                    message: "Agreement created.",
                    agreementId: newAgreementId,
                },
            })
            renderComponent({})

            await user.type(screen.getByLabelText(/Code/i), "AG-NEW")
            await user.type(screen.getByLabelText(/Name/i), "New Agreement")

            // The LocalPlanSearch component renders a combobox with a default placeholder text
            const providerPlanCombobox = screen.getAllByRole("combobox")[0]
            await user.click(providerPlanCombobox)
            await user.click(
                await screen.findByRole("option", { name: "PP01" }),
            )

            const localPlanCombobox = screen.getAllByRole("combobox")[1]
            await user.click(localPlanCombobox)
            await user.click(
                await screen.findByRole("option", { name: "LP01" }),
            )

            await user.type(
                screen.getByLabelText(/Contact Email/i),
                "test@test.com",
            )
            await user.type(
                screen.getByLabelText(/Description/i),
                "New Description",
            )

            await user.click(screen.getByRole("button", { name: /Save/i }))

            await waitFor(() => {
                expect(mockExecute).toHaveBeenCalledWith(
                    expect.objectContaining({
                        agreementId: "",
                        name: "New Agreement",
                        code: "AG-NEW",
                        providerPlanId: "f49465d9-e640-4d75-8f12-5bced30216e2",
                        localPlanId: "0ed67694-ac3a-4614-95af-f46ab45b3380",
                    }),
                )
                expect(mockToast).toHaveBeenCalledWith({
                    variant: "default",
                    title: "Success! 🎉",
                    description: "Agreement created.",
                })
            })
        })

        it("should display an error toast when the action fails", async () => {
            const user = userEvent.setup()
            mockExecute.mockResolvedValue({ serverError: "Database error" })
            renderComponent({})

            // Fill form with valid data
            await user.type(screen.getByLabelText(/Code/i), "AG-FAIL")
            await user.type(screen.getByLabelText(/Name/i), "Fail Agreement")

            const providerPlanCombobox = screen.getAllByRole("combobox")[0]
            await user.click(providerPlanCombobox)
            await user.click(
                await screen.findByRole("option", { name: "PP01" }),
            )

            const localPlanCombobox = screen.getAllByRole("combobox")[1]
            await user.click(localPlanCombobox)
            await user.click(
                await screen.findByRole("option", { name: "LP01" }),
            )
            await user.type(
                screen.getByLabelText(/Contact Email/i),
                "test@test.com",
            )
            await user.type(
                screen.getByLabelText(/Description/i),
                "Description",
            )

            await user.click(screen.getByRole("button", { name: /Save/i }))

            await waitFor(() => {
                expect(mockExecute).toHaveBeenCalled()
                expect(mockToast).toHaveBeenCalledWith({
                    variant: "destructive",
                    title: "Error",
                    description: "Save Failed",
                })
            })
        })

        it("should show loading state on the submit button while action is pending", () => {
            mockUseAction.mockReturnValue({
                executeAsync: mockExecute,
                isPending: true,
                result: {
                    data: null,
                    serverError: null,
                    validationErrors: null,
                },
                reset: jest.fn(),
            })

            renderComponent({})

            const submitButton = screen.getByRole("button", { name: /Saving/i })
            expect(submitButton).toBeDisabled()
            expect(
                within(submitButton).getByTestId("loader-circle-icon"),
            ).toBeInTheDocument()
        })
    })
})
