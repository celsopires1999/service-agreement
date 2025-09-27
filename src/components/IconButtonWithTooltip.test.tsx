import { IconButtonWithTooltip } from "@/components/IconButtonWithTooltip"
import { TooltipProvider } from "@/components/ui/tooltip"
import { render, screen } from "@testing-library/react"

// Mock for ResizeObserver. Components from libraries like Shadcn/ui often use
// ResizeObserver, which is not available in Jest's JSDOM environment.
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

// Mock for scrollIntoView. Components like Shadcn/ui's Command use
// this function, which is not implemented in JSDOM.
window.HTMLElement.prototype.scrollIntoView = jest.fn()

// Mock for lucide-react icons.
jest.mock("lucide-react", () => ({
    ListPlus: () => <div data-testid="list-plus-icon" />,
}))

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
        render(
            <TooltipProvider>
                <IconButtonWithTooltip {...mockProps} />
            </TooltipProvider>,
        )

        // Check if the icon is rendered
        expect(screen.getByTestId("list-plus-icon")).toBeInTheDocument()

        // Check if the link element has the correct href attribute
        const linkElement = screen.getByRole("link")
        expect(linkElement).toHaveAttribute("href", mockProps.href)
    })
})
