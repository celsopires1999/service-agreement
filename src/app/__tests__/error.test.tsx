import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ErrorComponent from "../error"

describe("ErrorComponent", () => {
    let consoleErrorSpy: jest.SpyInstance

    // Spy on console.error before each test to check if it's called,
    // and mock its implementation to keep the test output clean.
    beforeEach(() => {
        consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {})
    })

    // Restore the original console.error implementation after each test.
    afterEach(() => {
        consoleErrorSpy.mockRestore()
    })

    it("should render the error message and log the error", () => {
        const mockError = new Error("Test error")
        const mockReset = jest.fn()

        render(<ErrorComponent error={mockError} reset={mockReset} />)

        expect(
            screen.getByRole("heading", { name: /something went wrong/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /try again/i }),
        ).toBeInTheDocument()

        // The component logs the error via useEffect
        expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    })

    it("should call the reset function when the 'Try again' button is clicked", async () => {
        const user = userEvent.setup()
        const mockError = new Error("Another test error")
        const mockReset = jest.fn()

        render(<ErrorComponent error={mockError} reset={mockReset} />)

        const tryAgainButton = screen.getByRole("button", {
            name: /try again/i,
        })
        await user.click(tryAgainButton)

        expect(mockReset).toHaveBeenCalledTimes(1)
    })
})
