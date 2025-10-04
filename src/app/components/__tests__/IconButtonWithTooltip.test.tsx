import { render, screen } from "@testing-library/react"
import { IconButtonWithTooltip } from "../IconButtonWithTooltip"

// Mock for the next/link component to behave like a simple anchor tag in tests.
jest.mock("next/link", () => {
    // eslint-disable-next-line react/display-name
    return ({
        children,
        href,
    }: {
        children: React.ReactNode
        href: string
    }) => {
        return <a href={href}>{children}</a>
    }
})

describe("IconButtonWithTooltip", () => {
    const mockProps = {
        href: "/test-link",
        text: "Test Tooltip Text",
    }

    it("should render the icon button as a link with the correct href", () => {
        render(<IconButtonWithTooltip {...mockProps} />)

        // Check if the icon is rendered
        expect(screen.getByTestId("list-plus-icon")).toBeInTheDocument()

        // Check if the link element has the correct href attribute
        const linkElement = screen.getByRole("link")
        expect(linkElement).toHaveAttribute("href", mockProps.href)
    })
})
