import { render, screen } from "@testing-library/react"
import Template from "../template"

describe("Template", () => {
    it("should render children within a div with the 'animate-appear' class", () => {
        const childTestId = "child-element"
        const childText = "This is a child"

        render(
            <Template>
                <div data-testid={childTestId}>{childText}</div>
            </Template>,
        )

        const childElement = screen.getByTestId(childTestId)
        expect(childElement).toBeInTheDocument()
        expect(childElement).toHaveTextContent(childText)
        expect(childElement.parentElement).toHaveClass("animate-appear")
    })
})
