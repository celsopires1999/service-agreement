import { render, screen } from "@testing-library/react"
import { SystemServiceHeader } from "../SystemServiceHeader"
import { SystemNav } from "@/app/components/SystemNav"

// Mock the SystemNav component to isolate the SystemServiceHeader component
// and verify that props are passed correctly.
jest.mock("@/app/components/SystemNav", () => ({
    SystemNav: jest.fn(() => <div data-testid="mock-system-nav" />),
}))

// Type-safe mock for the child component
const MockedSystemNav = SystemNav as jest.Mock

describe("SystemServiceHeader", () => {
    const mockProps = {
        systemId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        name: "Awesome System Service",
        description:
            "This is a detailed description of the awesome system service.",
    }

    beforeEach(() => {
        // Clear mock history before each test to ensure isolation
        MockedSystemNav.mockClear()
    })

    it("should render the main title 'System Cost'", () => {
        render(<SystemServiceHeader {...mockProps} />)
        expect(
            screen.getByRole("heading", { name: "System Cost", level: 2 }),
        ).toBeInTheDocument()
    })

    it("should render the service name and description correctly", () => {
        render(<SystemServiceHeader {...mockProps} />)
        expect(
            screen.getByRole("heading", { name: mockProps.name, level: 2 }),
        ).toBeInTheDocument()
        expect(screen.getByText(mockProps.description)).toBeInTheDocument()
    })

    it("should render the SystemNav component with the correct props", () => {
        render(<SystemServiceHeader {...mockProps} />)

        expect(screen.getByTestId("mock-system-nav")).toBeInTheDocument()
        expect(MockedSystemNav).toHaveBeenCalledTimes(1)
        expect(MockedSystemNav).toHaveBeenCalledWith(
            {
                systemId: mockProps.systemId,
                omit: "cost",
            },
            undefined,
        )
    })
})
