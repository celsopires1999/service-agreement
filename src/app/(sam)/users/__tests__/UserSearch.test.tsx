import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserSearch } from "@/app/(sam)/users/UserSearch"

const mockPush = jest.fn()
const mockToString = jest.fn(() => "")

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    useSearchParams: () => ({
        toString: mockToString,
    }),
}))

// O SearchButton real não usa useFormStatus, então não precisamos mais mocká-lo
// para controlar o estado de pending.
jest.mock("@/app/components/SearchButton", () => ({
    SearchButton: () => <button type="submit">Search</button>,
}))

describe("UserSearch", () => {
    beforeEach(() => {
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

    it("should call router.push with the correct search params on submit", async () => {
        const user = userEvent.setup()
        render(<UserSearch />)

        const searchInput = screen.getByPlaceholderText("Search Users")
        await user.type(searchInput, "test search")

        expect(searchInput).toHaveValue("test search")

        const searchButton = screen.getByRole("button", { name: "Search" })
        await user.click(searchButton)

        expect(mockPush).toHaveBeenCalledTimes(1)
        expect(mockPush).toHaveBeenCalledWith(
            "/users?searchText=test+search&page=1",
        )
    })
})
