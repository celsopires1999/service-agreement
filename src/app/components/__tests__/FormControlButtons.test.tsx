import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FormControlButtons } from "../FormControlButtons"

// Mock next/navigation's useRouter for the test environment
const mockRouterBack = jest.fn()
jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            back: mockRouterBack,
        }
    },
}))

// Mock the LoaderCircle icon from lucide-react for testing purposes
jest.mock("lucide-react", () => ({
    LoaderCircle: (props: { className?: string }) => (
        <div data-testid="loader-circle" className={props.className} />
    ),
}))

describe("FormControlButtons", () => {
    const mockOnReset = jest.fn()

    beforeEach(() => {
        // Clear mocks before each test
        mockRouterBack.mockClear()
        mockOnReset.mockClear()
    })

    it("should render all buttons correctly in the default state", () => {
        render(<FormControlButtons isSaving={false} onReset={mockOnReset} />)

        const saveButton = screen.getByRole("button", { name: /Save/i })
        expect(saveButton).toBeInTheDocument()
        expect(saveButton).toBeEnabled()

        expect(
            screen.getByRole("button", { name: /Back/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /Reset/i }),
        ).toBeInTheDocument()
        expect(screen.queryByTestId("loader-circle")).not.toBeInTheDocument()
    })

    it("should show 'Saving' state and disable the save button when isSaving is true", () => {
        render(<FormControlButtons isSaving={true} onReset={mockOnReset} />)

        const saveButton = screen.getByRole("button", { name: /Saving/i })
        expect(saveButton).toBeInTheDocument()
        expect(saveButton).toBeDisabled()

        expect(screen.getByTestId("loader-circle")).toBeInTheDocument()
    })

    it("should call router.back when the Back button is clicked", async () => {
        render(<FormControlButtons isSaving={false} onReset={mockOnReset} />)

        const backButton = screen.getByRole("button", { name: /Back/i })
        await userEvent.click(backButton)

        expect(mockRouterBack).toHaveBeenCalledTimes(1)
    })

    it("should call onReset when the Reset button is clicked", async () => {
        render(<FormControlButtons isSaving={false} onReset={mockOnReset} />)

        const resetButton = screen.getByRole("button", { name: /Reset/i })
        await userEvent.click(resetButton)

        expect(mockOnReset).toHaveBeenCalledTimes(1)
    })
})
