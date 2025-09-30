import { render, screen } from "@testing-library/react"
import { DisplayServerActionResponse } from "../DisplayServerActionResponse"

describe("DisplayServerActionResponse", () => {
    it("should render nothing when the result is empty", () => {
        const { container } = render(
            <DisplayServerActionResponse result={{}} />,
        )
        // The main div should be empty
        expect(container.firstChild).toBeEmptyDOMElement()
    })

    it("should render a success message when data.message is provided", () => {
        const result = { data: { message: "Item created successfully" } }
        render(<DisplayServerActionResponse result={result} />)

        const successBox = screen.getByText(
            /Success: Item created successfully/i,
        )
        expect(successBox).toBeInTheDocument()
        expect(successBox).toHaveTextContent("🎉")
    })

    it("should not render the success message when showErrorOnly is true", () => {
        const result = { data: { message: "This should not be visible" } }
        render(<DisplayServerActionResponse result={result} showErrorOnly />)

        expect(
            screen.queryByText(/This should not be visible/i),
        ).not.toBeInTheDocument()
    })

    it("should render a server error message", () => {
        const result = { serverError: "Internal Server Error" }
        render(<DisplayServerActionResponse result={result} />)

        const errorBox = screen.getByText(/Internal Server Error/i)
        expect(errorBox).toBeInTheDocument()
        expect(errorBox).toHaveTextContent("🚨")
    })

    it("should render a single validation error", () => {
        const result = {
            validationErrors: { email: ["is not a valid email"] },
        }
        render(<DisplayServerActionResponse result={result} />)

        const errorBox = screen.getByText(/email: is not a valid email/i)
        expect(errorBox).toBeInTheDocument()
        expect(errorBox.parentElement).toHaveTextContent("🚨")
    })

    it("should render multiple validation errors", () => {
        const result = {
            validationErrors: {
                name: ["is too short"],
                password: ["must contain a number"],
            },
        }
        render(<DisplayServerActionResponse result={result} />)

        expect(screen.getByText(/name: is too short/i)).toBeInTheDocument()
        expect(
            screen.getByText(/password: must contain a number/i),
        ).toBeInTheDocument()
        expect(screen.getAllByText("🚨")).toHaveLength(1) // Only one error box
    })

    it("should render both server and validation errors", () => {
        const result = {
            serverError: "Failed to process request.",
            validationErrors: {
                field: ["is required"],
            },
        }
        render(<DisplayServerActionResponse result={result} />)

        // It should render two separate error boxes
        expect(
            screen.getByText(/Failed to process request./i),
        ).toBeInTheDocument()
        expect(screen.getByText(/field: is required/i)).toBeInTheDocument()
        expect(screen.getAllByRole("alert")).toHaveLength(2)
    })

    it("should not render success message if there are also errors", () => {
        const result = {
            data: { message: "Partial success" },
            serverError: "An error occurred",
        }
        render(<DisplayServerActionResponse result={result} />)

        expect(screen.queryByText(/Partial success/i)).not.toBeInTheDocument()
        expect(screen.getByText(/An error occurred/i)).toBeInTheDocument()
    })
})
