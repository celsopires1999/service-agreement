import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ModeToggle } from "../ModeToggle"

// Mock the useTheme hook from next-themes
const mockSetTheme = jest.fn()
jest.mock("next-themes", () => ({
    useTheme: () => ({
        setTheme: mockSetTheme,
    }),
}))

describe("ModeToggle", () => {
    beforeEach(() => {
        // Clear mock calls before each test
        mockSetTheme.mockClear()
        render(<ModeToggle />)
    })

    it("should render the toggle button with icons", () => {
        const toggleButton = screen.getByRole("button", {
            name: /Toggle theme/i,
        })
        expect(toggleButton).toBeInTheDocument()

        expect(screen.getByTestId("sun-icon")).toBeInTheDocument()
        expect(screen.getByTestId("moon-icon")).toBeInTheDocument()
    })

    it("should open the dropdown menu on click and show theme options", async () => {
        const toggleButton = screen.getByRole("button", {
            name: /Toggle theme/i,
        })
        await userEvent.click(toggleButton)

        expect(
            await screen.findByRole("menuitem", { name: /Light/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("menuitem", { name: /Dark/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("menuitem", { name: /System/i }),
        ).toBeInTheDocument()
    })

    it("should call setTheme with 'light' when Light option is clicked", async () => {
        const toggleButton = screen.getByRole("button", {
            name: /Toggle theme/i,
        })
        await userEvent.click(toggleButton)

        const lightOption = await screen.findByRole("menuitem", {
            name: /Light/i,
        })
        await userEvent.click(lightOption)

        expect(mockSetTheme).toHaveBeenCalledWith("light")
        expect(mockSetTheme).toHaveBeenCalledTimes(1)
    })

    it("should call setTheme with 'dark' when Dark option is clicked", async () => {
        const toggleButton = screen.getByRole("button", {
            name: /Toggle theme/i,
        })
        await userEvent.click(toggleButton)

        const darkOption = await screen.findByRole("menuitem", {
            name: /Dark/i,
        })
        await userEvent.click(darkOption)

        expect(mockSetTheme).toHaveBeenCalledWith("dark")
        expect(mockSetTheme).toHaveBeenCalledTimes(1)
    })

    it("should call setTheme with 'system' when System option is clicked", async () => {
        const toggleButton = screen.getByRole("button", {
            name: /Toggle theme/i,
        })
        await userEvent.click(toggleButton)

        const systemOption = await screen.findByRole("menuitem", {
            name: /System/i,
        })
        await userEvent.click(systemOption)

        expect(mockSetTheme).toHaveBeenCalledWith("system")
        expect(mockSetTheme).toHaveBeenCalledTimes(1)
    })
})
