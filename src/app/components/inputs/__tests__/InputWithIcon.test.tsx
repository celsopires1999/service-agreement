import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { InputWithIcon } from "../InputWithIcon"

describe("InputWithIcon", () => {
    it("should render the input with a default search icon", () => {
        render(<InputWithIcon placeholder="Search..." />)

        const input = screen.getByPlaceholderText("Search...")
        expect(input).toBeInTheDocument()

        const icon = screen.getByTestId("search-icon")
        expect(icon).toBeInTheDocument()
    })

    it("should render the input with a custom icon", () => {
        const customIcon = <svg data-testid="-custom-icon" />
        render(<InputWithIcon icon={customIcon} />)

        expect(screen.getByTestId("-custom-icon")).toBeInTheDocument()
        expect(screen.queryByTestId("-search-icon")).not.toBeInTheDocument()
    })

    it("should allow user to type into the input", async () => {
        const user = userEvent.setup()
        render(<InputWithIcon />)

        const input = screen.getByRole("textbox")
        await user.type(input, "Hello World")

        expect(input).toHaveValue("Hello World")
    })

    it("should forward additional props to the input element", () => {
        render(
            <InputWithIcon
                id="test-input"
                type="password"
                placeholder="Enter password"
                disabled
            />,
        )

        const input = screen.getByPlaceholderText("Enter password")
        expect(input).toHaveAttribute("id", "test-input")
        expect(input).toHaveAttribute("type", "password")
        expect(input).toBeDisabled()
    })

    it("should merge classNames correctly", () => {
        render(<InputWithIcon className="my-custom-class" />)

        const input = screen.getByRole("textbox")
        // The base Input component has its own classes, so we check for the specific ones
        expect(input.className).toContain("pr-10")
        expect(input.className).toContain("my-custom-class")
    })

    it("should forward the ref to the input element", () => {
        const ref = React.createRef<HTMLInputElement>()
        render(<InputWithIcon ref={ref} />)

        expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it("should render correctly when the icon prop is explicitly set to null", () => {
        render(<InputWithIcon icon={null} />)

        const input = screen.getByRole("textbox")
        expect(input).toBeInTheDocument()

        // The icon container div is still rendered, but it's empty
        const iconContainer = input.nextElementSibling
        expect(iconContainer).toBeInTheDocument()
        expect(iconContainer).toBeEmptyDOMElement()

        expect(screen.queryByTestId("search-icon")).not.toBeInTheDocument()
    })
})
