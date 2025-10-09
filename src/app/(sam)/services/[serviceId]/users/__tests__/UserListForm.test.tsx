import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserListForm } from "../UserListForm"
import { setupMockFormHooks } from "@/app/__mocks__/mock-form-hooks"
import { selectServiceSchemaType } from "@/zod-schemas/service"
import { getAgreementType } from "@/lib/queries/agreement"
import { getUserListItemsByServiceIdType } from "@/lib/queries/userList"

// Mock the server actions
jest.mock("@/actions/deleteUserListAction", () => ({
    deleteUserListAction: jest.fn(),
}))

jest.mock("@/actions/uploadUserListAction", () => ({
    uploadUserListAction: jest.fn(),
}))

const { mockExecute, mockToast } = setupMockFormHooks()

// Mock data
const mockService: selectServiceSchemaType = {
    serviceId: "ed2dbd55-511e-4b20-b96c-804c696a34f3",
    agreementId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    name: "Test Service",
    description: "A test service description.",
    runAmount: "100.00",
    chgAmount: "50.00",
    amount: "150.00",
    currency: "USD",
    responsibleEmail: "test@example.com",
    isActive: true,
    providerAllocation: "Provider A",
    localAllocation: "Local B",
    status: "created",
    validatorEmail: "validator@example.com",
    documentUrl: "http://example.com/doc",
    createdAt: new Date(),
    updatedAt: new Date(),
}

const mockAgreement: getAgreementType = {
    agreementId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    year: 2024,
    code: "AGR001",
    revision: 1,
    isRevised: false,
    revisionDate: "2024-01-01",
    providerPlanId: "b2c3d4e5-f6a7-8901-2345-67890abcdef1",
    localPlanId: "c3d4e5f6-a7b8-9012-3456-7890abcdef12",
    name: "Test Agreement",
    description: "Description for test agreement",
    contactEmail: "contact@example.com",
    comment: "No comments",
    localPlan: "LP2024",
    documentUrl: "http://example.com/agreement-doc",
}

const mockUserListItems: getUserListItemsByServiceIdType[] = [
    {
        userListItemId: "6694a4bf-a38c-4f46-bd6b-a0bac3018de4",
        name: "John Doe",
        email: "john.doe@example.com",
        corpUserId: "user1",
        area: "area1",
        costCenter: "1234",
    },
    {
        userListItemId: "a2b3c4d5-e6f7-8901-2345-67890abcdef1",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        corpUserId: "user2",
        area: "area2",
        costCenter: "5678",
    },
    {
        userListItemId: "f1e2d3c4-b5a6-7890-1234-567890abcdef2",
        name: "Peter Jones",
        email: "peter.jones@example.com",
        corpUserId: "user3",
        area: "area1",
        costCenter: "1234",
    },
]

const renderComponent = (
    props: Partial<React.ComponentProps<typeof UserListForm>> = {},
) => {
    const defaultProps = {
        service: mockService,
        agreement: mockAgreement,
    }
    return render(<UserListForm {...defaultProps} {...props} />)
}

describe("UserListForm", () => {
    it("should render the form with an empty user list in create mode", () => {
        renderComponent()

        expect(
            screen.getByRole("heading", {
                name: /User List: Test Service/i,
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole("heading", {
                name: /agr001/i,
            }),
        ).toBeInTheDocument()

        expect(screen.getByText(/test agreement/i)).toBeInTheDocument()

        expect(
            screen.getByText(/valid for 2024 with local plan lp2024/i),
        ).toBeInTheDocument()

        expect(
            screen.getByRole("button", {
                name: /load user list/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", {
                name: /delete user list/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("link", {
                name: /download user list/i,
            }),
        ).toBeInTheDocument()
    })

    it("should render the table with user list items", () => {
        renderComponent({ userListItems: mockUserListItems })

        expect(
            screen.getByRole("cell", { name: "John Doe" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "jane.smith@example.com" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "Peter Jones" }),
        ).toBeInTheDocument()
    })

    it("should hide Load and Delete buttons if agreement is revised", () => {
        renderComponent({
            agreement: { ...mockAgreement, isRevised: true },
        })

        expect(
            screen.queryByRole("button", { name: /load user list/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole("button", { name: /delete user list/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole("link", { name: /download user list/i }),
        ).toBeInTheDocument()
    })

    it("should show a toast message when download is clicked", async () => {
        const user = userEvent.setup()
        renderComponent()

        const downloadLink = screen.getByRole("link", {
            name: /download user list/i,
        })
        expect(downloadLink).toHaveAttribute(
            "href",
            `/api/services/${mockService.serviceId}/download`,
        )

        downloadLink.addEventListener("click", (e) => e.preventDefault())
        await user.click(downloadLink)

        expect(mockToast).toHaveBeenCalledWith({
            variant: "default",
            title: "Success! 🎉",
            description: "Download requested.",
        })
    })

    it("should show confirmation and delete user list on success", async () => {
        const user = userEvent.setup()
        mockExecute.mockResolvedValue({
            data: { message: "User list deleted successfully" },
        })
        renderComponent({ userListItems: mockUserListItems })

        await user.click(
            screen.getByRole("button", { name: /delete user list/i }),
        )

        expect(
            await screen.findByRole("heading", {
                name: /are you sure you want to delete the user list/i,
            }),
        ).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: /continue/i }))

        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({
                serviceId: mockService.serviceId,
            })
        })

        expect(mockToast).toHaveBeenCalledWith({
            variant: "default",
            title: "Success! 🎉",
            description: "User list deleted successfully",
        })
    })

    it("should show an error toast on delete failure", async () => {
        const user = userEvent.setup()
        mockExecute.mockResolvedValue({
            serverError: "Failed to delete user list.",
        })
        renderComponent({ userListItems: mockUserListItems })

        await user.click(
            screen.getByRole("button", { name: /delete user list/i }),
        )
        await user.click(
            await screen.findByRole("button", { name: /continue/i }),
        )

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete user list.",
            })
        })
    })
})
