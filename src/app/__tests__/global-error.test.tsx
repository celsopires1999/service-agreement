import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import GlobalError from "../global-error"

describe("GlobalError", () => {
    const mockReset = jest.fn()
    const mockError = new Error("Test error")

    beforeEach(() => {
        // Mock console.error to prevent logging during tests
        jest.spyOn(console, "error").mockImplementation(() => {})
        mockReset.mockClear()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("should render the error message and reset button", () => {
        render(<GlobalError error={mockError} reset={mockReset} />)

        expect(
            screen.getByRole("heading", { name: /something went wrong/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /try again/i }),
        ).toBeInTheDocument()
    })

    it("should call the reset function when the 'Try again' button is clicked", async () => {
        const user = userEvent.setup()
        // The global-error component renders its own <html> and <body> tags.
        // We must render it in the document's root to avoid nested <body> tags,
        // which can break event handling in JSDOM.
        render(<GlobalError error={mockError} reset={mockReset} />, {
            container: document.documentElement,
        })

        await user.click(screen.getByRole("button", { name: /try again/i }))

        expect(mockReset).toHaveBeenCalledTimes(1)
    })
})
