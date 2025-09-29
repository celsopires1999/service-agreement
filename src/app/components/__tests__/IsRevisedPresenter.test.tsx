import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { IsRevisedPresenter } from "../IsRevisedPresenter"

// Mock the lucide-react icons for testing purposes
jest.mock("lucide-react", () => ({
    CircleCheckIcon: (props: { className?: string }) => (
        <div data-testid="check-icon" className={props.className} />
    ),
    CircleXIcon: (props: { className?: string }) => (
        <div data-testid="x-icon" className={props.className} />
    ),
}))

describe("IsRevisedPresenter", () => {
    it("should render the X icon with opacity when value is false", () => {
        render(<IsRevisedPresenter value={false} />)

        const xIcon = screen.getByTestId("x-icon")
        expect(xIcon).toBeInTheDocument()
        expect(xIcon).toHaveClass("opacity-25")
        expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument()
    })

    it("should render the Check icon with green text when value is true", () => {
        render(<IsRevisedPresenter value={true} />)

        const checkIcon = screen.getByTestId("check-icon")
        expect(checkIcon).toBeInTheDocument()
        expect(checkIcon).toHaveClass("text-green-600")
        expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument()
    })

    it.each([
        ["null", null],
        ["undefined", undefined],
        ["a string", "text"],
        ["a number", 1],
    ])("should render the Check icon when value is %s", (_desc, val) => {
        render(<IsRevisedPresenter value={val} />)

        expect(screen.getByTestId("check-icon")).toBeInTheDocument()
        expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument()
    })
})
