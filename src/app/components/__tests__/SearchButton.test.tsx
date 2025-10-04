import { render, screen } from "@testing-library/react"
import { SearchButton } from "../SearchButton"

// Mock useFormStatus from react-dom
jest.mock("react-dom", () => ({
    ...jest.requireActual("react-dom"),
    useFormStatus: jest.fn(),
}))

describe("SearchButton", () => {
    // Import useFormStatus after mocking
    const { useFormStatus } = jest.requireMock("react-dom")

    it("should render 'Search' and be enabled when not pending", () => {
        // Mock useFormStatus to return { pending: false }
        useFormStatus.mockReturnValue({ pending: false })

        render(<SearchButton />)
        const searchButton = screen.getByRole("button", { name: /Search/i })
        expect(searchButton).toBeInTheDocument()
        expect(searchButton).toBeEnabled()
        expect(screen.queryByTestId("loader-circle")).not.toBeInTheDocument()
    })

    it("should render LoaderCircle and be disabled when pending", () => {
        // Mock useFormStatus to return { pending: true }
        useFormStatus.mockReturnValue({ pending: true })

        render(<SearchButton />)
        const searchButton = screen.getByRole("button") // No specific name when pending, as text is replaced by icon
        expect(searchButton).toBeDisabled()
        expect(screen.getByTestId("loader-circle-icon")).toBeInTheDocument()
    })
})
