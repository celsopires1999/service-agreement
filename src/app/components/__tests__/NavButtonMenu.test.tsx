import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LucideIcon } from "lucide-react"
import { NavButtonMenu } from "../NavButtonMenu"

// Mock a generic lucide-react icon for testing purposes.
const MockIcon = (() => (
    <div data-testid="mock-icon" />
)) as unknown as LucideIcon

// Mock the Next.js Link component to work in the test environment.
jest.mock("next/link", () => {
    // eslint-disable-next-line react/display-name
    return ({
        children,
        href,
        ...props
    }: {
        children: React.ReactNode
        href: string
    }) => (
        <a href={href} {...props}>
            {children}
        </a>
    )
})

describe("NavButtonMenu", () => {
    const label = "Test Menu"
    const choices = [
        { title: "Choice 1", href: "/choice-1" },
        { title: "Choice 2", href: "/choice-2" },
    ]

    beforeEach(() => {
        render(
            <NavButtonMenu icon={MockIcon} label={label} choices={choices} />,
        )
    })

    it("should render the trigger button with the correct label and icon", () => {
        const triggerButton = screen.getByRole("button", { name: label })
        expect(triggerButton).toBeInTheDocument()
        expect(screen.getByTestId("mock-icon")).toBeInTheDocument()
    })

    it("should not show menu items initially", () => {
        expect(screen.queryByRole("menuitem")).not.toBeInTheDocument()
    })

    it("should show menu items when the trigger button is clicked", async () => {
        const triggerButton = screen.getByRole("button", { name: label })
        await userEvent.click(triggerButton)

        const choice1 = await screen.findByRole("menuitem", {
            name: /Choice 1/i,
        })
        const choice2 = screen.getByRole("menuitem", { name: /Choice 2/i })

        expect(choice1).toBeInTheDocument()
        expect(choice2).toBeInTheDocument()
    })

    it("should render menu items with correct links", async () => {
        const triggerButton = screen.getByRole("button", { name: label })
        await userEvent.click(triggerButton)

        // The menu item itself is a link because of `asChild`
        expect(await screen.findByText("Choice 1")).toHaveAttribute(
            "href",
            "/choice-1",
        )
        expect(screen.getByText("Choice 2")).toHaveAttribute(
            "href",
            "/choice-2",
        )
    })
})
