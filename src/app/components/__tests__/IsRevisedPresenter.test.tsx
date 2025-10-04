import { render, screen } from "@testing-library/react"
import { IsRevisedPresenter } from "../IsRevisedPresenter"

describe("IsRevisedPresenter", () => {
    it("should render the X icon with opacity when value is false", () => {
        render(<IsRevisedPresenter value={false} />)

        const xIcon = screen.getByTestId("circle-x-icon-icon")
        expect(xIcon).toBeInTheDocument()
        expect(xIcon).toHaveClass("opacity-25")
        expect(
            screen.queryByTestId("-circle-check-icon-icon"),
        ).not.toBeInTheDocument()
    })

    it("should render the Check icon with green text when value is true", () => {
        render(<IsRevisedPresenter value={true} />)

        const checkIcon = screen.getByTestId("circle-check-icon-icon")
        expect(checkIcon).toBeInTheDocument()
        expect(checkIcon).toHaveClass("text-green-600")
        expect(
            screen.queryByTestId("circle-x-icon-icon"),
        ).not.toBeInTheDocument()
    })

    it.each([
        ["null", null],
        ["undefined", undefined],
        ["a string", "text"],
        ["a number", 1],
    ])("should render the Check icon when value is %s", (_desc, val) => {
        render(<IsRevisedPresenter value={val} />)

        expect(screen.getByTestId("circle-check-icon-icon")).toBeInTheDocument()
        expect(
            screen.queryByTestId("circle-x-icon-icon"),
        ).not.toBeInTheDocument()
    })
})
