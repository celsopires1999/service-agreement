import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { AmountPresenter } from "../AmountPresenter"

describe("AmountPresenter", () => {
    it("should render the value with text-right class when it is a number", () => {
        render(<AmountPresenter value={123.45} />)
        const element = screen.getByText("123.45")
        expect(element).toBeInTheDocument()
        expect(element).toHaveClass("text-right")
    })

    it("should render the value with text-right class when it is a string", () => {
        render(<AmountPresenter value={"99,99"} />)
        const element = screen.getByText("99,99")
        expect(element).toBeInTheDocument()
        expect(element).toHaveClass("text-right")
    })

    it.each([
        ["null", null],
        ["undefined", undefined],
        ["a boolean", true],
        ["an object", { a: 1 }],
        ["an array", [1, 2]],
    ])(
        "should render an empty div when the value is %s",
        (_desc, invalidValue) => {
            // The component renders <div></div>, so the container will have an empty div child.
            const { container } = render(
                <AmountPresenter value={invalidValue} />,
            )
            const divElement = container.firstChild

            expect(divElement).toBeInTheDocument()
            expect(divElement).toBeEmptyDOMElement()
            expect(divElement).not.toHaveClass("text-right")
        },
    )
})
