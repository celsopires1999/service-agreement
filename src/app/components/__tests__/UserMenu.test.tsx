import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Mock the auth function to control the session state in tests.
const mockAuth = jest.fn()
jest.mock("@/auth", () => ({
    auth: () => mockAuth(),
}))

// Mock the SignOut component as its functionality is tested separately.
jest.mock("@/app/components/SignOut", () => ({
    SignOut: () => <div data-testid="sign-out-component" />,
}))

describe("UserMenu", () => {
    beforeEach(async () => {
        // Clear mock implementations and calls before each test.
        mockAuth.mockClear()
    })

    it("should render user information when the user is authenticated", async () => {
        // Mock an authenticated session.
        mockAuth.mockResolvedValue({
            user: { name: "John Doe", role: "Admin" },
        })

        // Dynamically import and render the async component.
        const { UserMenu } = await import("../UserMenu")
        render(await UserMenu())

        // Find the trigger button and click it to open the menu.
        const triggerButton = screen.getByRole("button", { name: /User menu/i })
        expect(triggerButton).toBeInTheDocument()
        expect(screen.getByTestId("circle-user-icon-icon")).toBeInTheDocument()

        await userEvent.click(triggerButton)

        // Assert that user-specific information is displayed.
        expect(await screen.findByText("My Account")).toBeInTheDocument()
        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(screen.getByText("Admin")).toBeInTheDocument()
        expect(screen.getByTestId("sign-out-component")).toBeInTheDocument()
    })

    it("should render without user information when the user is not authenticated", async () => {
        // Mock an unauthenticated session (auth() returns null).
        mockAuth.mockResolvedValue(null)

        const { UserMenu } = await import("../UserMenu")
        render(await UserMenu())

        const triggerButton = screen.getByRole("button", { name: /User menu/i })
        await userEvent.click(triggerButton)

        // The menu should still open.
        expect(await screen.findByText("My Account")).toBeInTheDocument()

        // Assert that user-specific elements are not present.
        // The component renders empty spans for name and role when there's no user.
        // We should check that these spans do not contain any text.
        const nameSpan = screen
            .getByText("My Account")
            .parentElement?.parentElement?.querySelector(".font-medium")
        const roleSpan = screen
            .getByText("My Account")
            .parentElement?.parentElement?.querySelector(
                ".text-xs.text-muted-foreground",
            )

        expect(nameSpan).toBeInTheDocument()
        expect(roleSpan).toBeInTheDocument()
        expect(nameSpan).toBeEmptyDOMElement()
        expect(roleSpan).toBeEmptyDOMElement()

        // The SignOut component should still be rendered.
        expect(screen.getByTestId("sign-out-component")).toBeInTheDocument()
    })

    it("should not show menu items initially", async () => {
        mockAuth.mockResolvedValue(null)
        const { UserMenu } = await import("../UserMenu")
        render(await UserMenu())
        expect(screen.queryByText("My Account")).not.toBeInTheDocument()
    })
})
