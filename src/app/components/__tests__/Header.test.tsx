import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
    HomeIcon: () => <div data-testid="home-icon" />,
    HandshakeIcon: () => <div data-testid="handshake-icon" />,
    FileIcon: () => <div data-testid="file-icon" />,
    CpuIcon: () => <div data-testid="cpu-icon" />,
    EuroIcon: () => <div data-testid="euro-icon" />,
    UsersRoundIcon: () => <div data-testid="users-round-icon" />,
    Sun: () => <div data-testid="sun-icon" />,
    Moon: () => <div data-testid="moon-icon" />,
    LogOut: () => <div data-testid="logout-icon" />,
}))

// Mock next/link
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

// Mock next-themes
jest.mock("next-themes", () => ({
    useTheme: () => ({
        setTheme: jest.fn(),
    }),
}))

// Mock the async UserMenu component
jest.mock("../UserMenu", () => ({
    UserMenu: () => (
        <button aria-label="User menu" title="User menu">
            <div data-testid="circle-user-icon" />
        </button>
    ),
}))

describe("Header", () => {
    beforeEach(async () => {
        // Use a dynamic import for the component to ensure mocks are applied
        const { Header } = await import("../Header")
        render(<Header />)
    })

    it("should render the header with the main title and home link", () => {
        expect(
            screen.getByRole("heading", {
                name: /Service Agreement Validation/i,
            }),
        ).toBeInTheDocument()

        const homeLink = screen.getAllByRole("link", { name: /Home/i })[0]
        expect(homeLink).toHaveAttribute("href", "/agreements")
    })

    it("should render all navigation buttons and menus", () => {
        expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /Agreements/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("link", { name: /Services/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /Systems/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("link", { name: /Company Plans/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /Users/i }),
        ).toBeInTheDocument()
    })

    it("should render the theme toggle and user menu", () => {
        expect(
            screen.getByRole("button", { name: /Toggle theme/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /User menu/i }),
        ).toBeInTheDocument()
    })

    it("should open the Agreements menu on click", async () => {
        const agreementsButton = screen.getByRole("button", {
            name: /Agreements/i,
        })
        await userEvent.click(agreementsButton)

        expect(
            await screen.findByRole("menuitem", { name: /Search Agreements/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("menuitem", { name: /New Agreement/i }),
        ).toBeInTheDocument()
    })
})
