import { render, screen } from "@testing-library/react"
import Loading from "../loading"

describe("Loading", () => {
    it("should render a spinning loader icon", () => {
        // Arrange
        render(<Loading />)

        // Act
        // The LoaderCircle icon is automatically mocked and assigned a data-testid
        // based on its name, as per the UI test instructions.
        const loaderIcon = screen.getByTestId("loader-circle-icon")

        // Assert
        expect(loaderIcon).toBeInTheDocument()
        expect(loaderIcon).toHaveClass("animate-spin") // Verify the spinning animation class
    })
})
