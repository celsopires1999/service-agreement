import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import Deleting from "../Deleting"

// Mock the LoaderCircle icon from lucide-react for testing purposes
jest.mock("lucide-react", () => ({
    LoaderCircle: (props: { className?: string }) => (
        <div data-testid="loader-circle" className={props.className} />
    ),
}))

describe("Deleting", () => {
    it("should render the overlay with a spinning loader icon", () => {
        render(<Deleting />)

        // Check if the loader icon is rendered
        const loaderIcon = screen.getByTestId("loader-circle")
        expect(loaderIcon).toBeInTheDocument()

        // Check if the loader has the correct styling and animation classes
        expect(loaderIcon).toHaveClass(
            "h-20 w-20 animate-spin text-foreground/20",
        )
    })
})
