import React from "react"
import { render, screen } from "@testing-library/react"
import NotAuthorizedLayout from "../layout"

describe("NotAuthorizedLayout", () => {
    it("should render its children correctly", () => {
        const childText = "Child Component"
        render(
            <NotAuthorizedLayout>
                <h1>{childText}</h1>
            </NotAuthorizedLayout>,
        )

        const childElement = screen.getByRole("heading", { name: childText })
        expect(childElement).toBeInTheDocument()
    })

    it("should render the main layout container", () => {
        const { container } = render(
            <NotAuthorizedLayout>child</NotAuthorizedLayout>,
        )
        expect(container.firstChild).toHaveClass("mx-auto w-full max-w-7xl")
    })
})
