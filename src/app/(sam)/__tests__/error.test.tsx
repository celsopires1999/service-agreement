import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ErrorComponent from "../error"

describe("Error Component", () => {
    const mockReset = jest.fn()
    const mockError = new Error("Test error message")
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
        // We spy on console.error to assert it's called without polluting the test output.
        consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {})
        mockReset.mockClear()
    })

    afterEach(() => {
        // Restore the original implementation after each test
        consoleErrorSpy.mockRestore()
    })

    it("should render the error message and recovery button", () => {
        render(<ErrorComponent error={mockError} reset={mockReset} />)

        expect(
            screen.getByRole("heading", { name: /something went wrong/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /try again/i }),
        ).toBeInTheDocument()
    })

    it("should log the error to the console on mount", () => {
        render(<ErrorComponent error={mockError} reset={mockReset} />)

        expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    })

    it('should call the reset function when the "Try again" button is clicked', async () => {
        render(<ErrorComponent error={mockError} reset={mockReset} />)

        await userEvent.click(
            screen.getByRole("button", { name: /try again/i }),
        )
        expect(mockReset).toHaveBeenCalledTimes(1)
    })
})
