import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useFormStatus } from "react-dom" // This import will be the mocked version
import { SystemSearch } from "@/app/(sam)/systems/SystemSearch"
import { useRouter, useSearchParams } from "next/navigation"

// Mock next/navigation
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}))

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
const mockUseRouter = useRouter as jest.Mock
const mockUseSearchParams = useSearchParams as jest.Mock

describe("SystemSearch", () => {
    const mockPush = jest.fn()

    beforeEach(() => {
        // Set the default mock state for useFormStatus
        mockUseFormStatus.mockReturnValue({ pending: false })
        mockUseRouter.mockReturnValue({
            push: mockPush,
        })
        mockUseSearchParams.mockReturnValue({
            toString: () => "",
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should render the search input and button", () => {
        render(<SystemSearch />)
        expect(
            screen.getByPlaceholderText("Search Systems"),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Search" }),
        ).toBeInTheDocument()
    })

    it("should render with a default search value if provided", () => {
        render(<SystemSearch searchText="SAP" />)
        expect(screen.getByPlaceholderText("Search Systems")).toHaveValue("SAP")
    })

    it("should allow the user to type in the search input", async () => {
        const user = userEvent.setup()
        render(<SystemSearch />)

        const searchInput = screen.getByPlaceholderText("Search Systems")
        await user.type(searchInput, "test search")

        expect(searchInput).toHaveValue("test search")
    })

    it("should render the form with the correct action attribute", () => {
        render(<SystemSearch />)
        const formElement = screen.getByTestId("system-search-form")
        expect(formElement).toHaveAttribute("action", "/systems")
    })

    it("should display loading state when form is submitting", () => {
        mockUseFormStatus.mockReturnValue({ pending: true })
        render(<SystemSearch />)

        expect(
            screen.getByRole("button", { name: "Loading..." }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole("button", { name: "Search" }),
        ).not.toBeInTheDocument()
    })

    it("should call router.push with the correct search parameters on submit", async () => {
        const user = userEvent.setup()
        render(<SystemSearch />)

        const searchInput = screen.getByPlaceholderText("Search Systems")
        await user.type(searchInput, "My System")

        const searchButton = screen.getByRole("button", { name: "Search" })
        await user.click(searchButton)

        expect(mockPush).toHaveBeenCalledWith(
            "/systems?searchText=My+System&page=1",
        )
    })
})
