import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SignOut } from "../SignOut"

// Mock the server action. We need to mock the module and then provide a mock implementation for the action.
const mockLogout = jest.fn()
jest.mock("../../../actions/logoutAction", () => ({
    // The key here must match the exported function name from the action file.
    logout: () => mockLogout(),
}))

// Mock the lucide-react icon for this component.
jest.mock("lucide-react", () => ({
    LogOut: () => <div data-testid="logout-icon" />,
}))

describe("SignOut", () => {
    beforeEach(() => {
        // Clear mock history before each test.
        mockLogout.mockClear()
        render(<SignOut />)
    })

    it("should render the logout button with the correct attributes and icon", () => {
        const button = screen.getByRole("button", { name: /LogOut/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute("type", "submit")
        expect(button).toHaveAttribute("title", "Log Out")
        expect(screen.getByTestId("logout-icon")).toBeInTheDocument()
    })

    it("should call the logout server action when the button is clicked", async () => {
        const button = screen.getByRole("button", { name: /LogOut/i })
        await userEvent.click(button)

        // Clicking a submit button within a form triggers the form's `action`.
        expect(mockLogout).toHaveBeenCalledTimes(1)
    })
})
