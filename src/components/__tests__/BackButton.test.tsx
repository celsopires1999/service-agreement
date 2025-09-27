import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BackButton } from "../BackButton"

// Mock next/navigation's useRouter for the test environment
const mockRouterBack = jest.fn()
jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            back: mockRouterBack,
        }
    },
}))

describe("BackButton", () => {
    beforeEach(() => {
        // Clear the mock before each test to ensure test independence
        mockRouterBack.mockClear()
    })

    it("should render with the correct title", () => {
        render(<BackButton title="Return" />)
        const button = screen.getByRole("button", { name: /Return/i })
        expect(button).toBeInTheDocument()
    })

    it("should call router.back when clicked", async () => {
        render(<BackButton title="Go Back" />)
        const button = screen.getByRole("button", { name: /Go Back/i })
        await userEvent.click(button)
        expect(mockRouterBack).toHaveBeenCalledTimes(1)
    })

    it("should apply additional props like className", () => {
        render(<BackButton title="Back" className="my-custom-class" />)
        const button = screen.getByRole("button", { name: /Back/i })
        expect(button).toHaveClass("my-custom-class")
    })
})
