import { render, screen } from "@testing-library/react"
import { SystemNav } from "../SystemNav"

// Mock the Next.js Link component to work in the test environment.
jest.mock("next/link", () => {
    // eslint-disable-next-line react/display-name
    return ({
        children,
        href,
        prefetch, // Destructure prefetch to avoid passing it to the <a> tag
        ...props
    }: {
        children: React.ReactNode
        href: string
        prefetch?: boolean
    }) => (
        <a href={href} {...props} data-prefetch={prefetch}>
            {children}
        </a>
    )
})

describe("SystemNav", () => {
    const systemId = "system-123"

    it("should render nothing if no systemId is provided", () => {
        const { container } = render(<SystemNav />)
        // The component returns null, so the container should be empty.
        expect(container).toBeEmptyDOMElement()
    })

    it("should render both links when only systemId is provided", () => {
        render(<SystemNav systemId={systemId} />)

        const systemLink = screen.getByRole("link", { name: /System/i })
        const costLink = screen.getByRole("link", { name: /Cost/i })

        expect(systemLink).toBeInTheDocument()
        expect(costLink).toBeInTheDocument()

        expect(systemLink).toHaveAttribute(
            "href",
            `/systems/form?systemId=${systemId}`,
        )
        expect(costLink).toHaveAttribute("href", `/systems/${systemId}`)
    })

    it("should omit the 'System' link when omit='system'", () => {
        render(<SystemNav systemId={systemId} omit="system" />)

        expect(
            screen.queryByRole("link", { name: /System/i }),
        ).not.toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Cost/i })).toBeInTheDocument()
    })

    it("should omit the 'Cost' link when omit='cost'", () => {
        render(<SystemNav systemId={systemId} omit="cost" />)

        expect(
            screen.getByRole("link", { name: /System/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole("link", { name: /Cost/i }),
        ).not.toBeInTheDocument()
    })
})
