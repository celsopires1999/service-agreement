import { render, screen } from "@testing-library/react"
import Deleting from "../Deleting"

describe("Deleting", () => {
    it("should render the overlay with a spinning loader icon", () => {
        render(<Deleting />)

        // Check if the loader icon is rendered
        const loaderIcon = screen.getByTestId("loader-circle-icon")
        expect(loaderIcon).toBeInTheDocument()

        // Check if the loader has the correct styling and animation classes
        expect(loaderIcon).toHaveClass(
            "h-20 w-20 animate-spin text-foreground/20",
        )
    })
})
