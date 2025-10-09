import React from "react"
import { render, screen } from "@testing-library/react"
import RSLayout from "../layout"

// Mock the Header component to isolate the layout component during testing.
jest.mock("@/app/components/Header", () => ({
    Header: () => {
        return <header>Mocked Header</header>
    },
}))

describe("RSLayout", () => {
    it("should render the Header and its children correctly", () => {
        const childText = "This is a child component"

        render(
            <RSLayout>
                <div>{childText}</div>
            </RSLayout>,
        )

        expect(screen.getByRole("banner")).toHaveTextContent("Mocked Header")
        expect(screen.getByText(childText)).toBeInTheDocument()
    })
})
