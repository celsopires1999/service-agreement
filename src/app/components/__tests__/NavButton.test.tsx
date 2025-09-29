import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { LucideIcon } from "lucide-react"
import React from "react"
import { NavButton } from "../NavButton"

// Mock a generic lucide-react icon
const MockIcon = (() => (
    <div data-testid="mock-icon" />
)) as unknown as LucideIcon

// Mock the Tooltip components to simplify testing
jest.mock("../../../components/ui/tooltip", () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipContent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
    TooltipProvider: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
}))

// Mock the Next.js Link component to work in the test environment
jest.mock("next/link", () => {
    // eslint-disable-next-line react/display-name
    return ({
        children,
        href,
        ...props
    }: {
        children: React.ReactNode
        href: string
    }) => {
        return (
            <a href={href} {...props}>
                {children}
            </a>
        )
    }
})

describe("NavButton", () => {
    const label = "Test Button"

    it("should render as a link when href is provided", () => {
        const href = "/test-path"
        render(<NavButton icon={MockIcon} label={label} href={href} />)

        // The button is rendered as a link because of `asChild`
        const linkElement = screen.getByRole("link", { name: label })
        expect(linkElement).toBeInTheDocument()
        expect(linkElement).toHaveAttribute("href", href)
        expect(linkElement).toHaveAttribute("title", label)

        // The icon should be inside the link
        expect(linkElement).toContainElement(screen.getByTestId("mock-icon"))

        // There should not be a separate button element
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("should render only the icon when href is not provided", () => {
        render(<NavButton icon={MockIcon} label={label} />)

        // The icon should be rendered
        expect(screen.getByTestId("mock-icon")).toBeInTheDocument()

        // There should not be a link or button element
        expect(screen.queryByRole("link")).not.toBeInTheDocument()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })
})
