import { setupMockTableHooks } from "@/app/__mocks__/mock-table-hooks"
import { getUserListItemsByServiceIdType } from "@/lib/queries/userList"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserListTable } from "../UserListTable"

const { mockRouterReplace } = setupMockTableHooks()

const mockUsers: getUserListItemsByServiceIdType[] = [
    {
        userListItemId: "ul1",
        name: "John Doe",
        email: "john.doe@example.com",
        corpUserId: "johndoe",
        area: "Sales",
        costCenter: "CC123",
    },
    {
        userListItemId: "ul2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        corpUserId: "janesmith",
        area: "Marketing",
        costCenter: "CC456",
    },
]

describe("UserListTable", () => {
    const renderComponent = (
        data: getUserListItemsByServiceIdType[] = mockUsers,
    ) => {
        return render(<UserListTable data={data} />)
    }

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks()
    })

    it("renders the table with user data correctly", () => {
        renderComponent()

        // Check for table headers
        expect(
            screen.getByRole("columnheader", { name: "Name" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: "Email" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: "Corp User ID" }),
        ).toBeInTheDocument()

        // Check for table rows
        expect(
            screen.getByRole("cell", { name: "John Doe" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "jane.smith@example.com" }),
        ).toBeInTheDocument()
    })

    it('renders "0 total results" message when there is no data', () => {
        renderComponent([])
        expect(screen.getByText(/0 total results/i)).toBeInTheDocument()
    })

    it("allows filtering the table data", async () => {
        const user = userEvent.setup()
        renderComponent()

        expect(
            screen.getByRole("cell", { name: "John Doe" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("cell", { name: "Jane Smith" }),
        ).toBeInTheDocument()

        const nameFilterInput = screen.getAllByPlaceholderText(/search.../i)[0]
        await user.type(nameFilterInput, "John")

        await waitFor(() => {
            expect(
                screen.getByRole("cell", { name: "John Doe" }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole("cell", { name: "Jane Smith" }),
            ).not.toBeInTheDocument()
        })
    })

    it("allows sorting the table data", async () => {
        const user = userEvent.setup()
        renderComponent()
        const rows = screen.getAllByRole("row")

        // First cell of the first data row
        expect(
            within(rows[1]).getByRole("cell", { name: "Jane Smith" }),
        ).toBeInTheDocument()

        const nameHeader = screen.getByRole("button", { name: /name/i })
        await user.click(nameHeader) // Sort descending

        await waitFor(() => {
            const newRows = screen.getAllByRole("row")
            expect(
                within(newRows[1]).getByRole("cell", { name: "John Doe" }),
            ).toBeInTheDocument()
        })
    })

    it("handles pagination correctly", async () => {
        const user = userEvent.setup()
        const manyUsers = Array.from({ length: 15 }, (_, i) => ({
            ...mockUsers[0],
            userListId: `ul${i}`,
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
