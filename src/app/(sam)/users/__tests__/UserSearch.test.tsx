import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useFormStatus } from "react-dom" // This import will be the mocked version
import { UserSearch } from "@/app/(sam)/users/UserSearch"

// Mock the 'next/form' component to render a standard form element
jest.mock("next/form", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ({ children, ...props }: any) => (
        <form {...props} data-testid="user-search-form">
            {children}
        </form>
    )
})

// Mock the useFormStatus hook first
jest.mock("react-dom", () => ({
    ...jest.requireActual("react-dom"),
    useFormStatus: jest.fn(),
}))

// Now, mock the SearchButton. It will use the mocked `useFormStatus` from above.
jest.mock("@/app/components/SearchButton", () => ({
    SearchButton: () => {
        // This `useFormStatus` is now the mocked one we control in the test
        const { pending } = useFormStatus()
        return (
            <button type="submit">{pending ? "Loading..." : "Search"}</button>
        )
    },
}))

const mockUseFormStatus = useFormStatus as jest.Mock

describe("UserSearch", () => {
    beforeEach(() => {
        // Set the default mock state for useFormStatus
        mockUseFormStatus.mockReturnValue({ pending: false })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should render the search input and button", () => {
        render(<UserSearch />)
        expect(screen.getByPlaceholderText("Search Users")).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Search" }),
        ).toBeInTheDocument()
    })

    it("should render with a default search value if provided", () => {
        render(<UserSearch searchText="John Doe" />)
        expect(screen.getByPlaceholderText("Search Users")).toHaveValue(
            "John Doe",
        )
    })

    it("should allow the user to type in the search input", async () => {
        const user = userEvent.setup()
        render(<UserSearch />)

        const searchInput = screen.getByPlaceholderText("Search Users")
        await user.type(searchInput, "test search")

        expect(searchInput).toHaveValue("test search")
    })

    it("should render the form with the correct action attribute", () => {
        render(<UserSearch />)
        const formElement = screen.getByTestId("user-search-form")
        expect(formElement).toHaveAttribute("action", "/users")
    })

    it("should display loading state when form is submitting", () => {
        mockUseFormStatus.mockReturnValue({ pending: true })
        render(<UserSearch />)

        expect(
            screen.getByRole("button", { name: "Loading..." }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole("button", { name: "Search" }),
        ).not.toBeInTheDocument()
    })
})
