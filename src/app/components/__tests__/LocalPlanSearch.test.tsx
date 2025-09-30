import { LocalPlanSearch } from "../LocalPlanSearch"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Mock for ResizeObserver. Components like Shadcn/ui's Popover use
// ResizeObserver, which is not available in Jest's JSDOM environment.
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

// Mock for scrollIntoView. The Command component from Shadcn/ui uses
// this function, which is not implemented in JSDOM.
window.HTMLElement.prototype.scrollIntoView = jest.fn()

const mockData = [
    { id: "1", description: "Strategic Master Plan" },
    { id: "2", description: "Urban Zoning" },
    { id: "3", description: "Building Code" },
]

describe("LocalPlanSearch", () => {
    it("should render with the default text when no value is selected", () => {
        render(<LocalPlanSearch fieldName="localPlan" data={mockData} />)

        const combobox = screen.getByRole("combobox")
        expect(combobox).toHaveTextContent("Local Plan")

        const hiddenInput = screen.getByTestId("hidden-localPlan-input")
        expect(hiddenInput).toHaveValue("")
    })

    it("should render with the pre-selected default value", () => {
        render(
            <LocalPlanSearch
                fieldName="localPlan"
                data={mockData}
                defaultValue="2"
            />,
        )

        const combobox = screen.getByRole("combobox")
        expect(combobox).toHaveTextContent("Urban Zoning")

        const hiddenInput = screen.getByTestId("hidden-localPlan-input")
        expect(hiddenInput).toHaveValue("2")
    })

    it("should open the popover, allow selecting an item, and update the value", async () => {
        const user = userEvent.setup()
        render(<LocalPlanSearch fieldName="localPlan" data={mockData} />)

        const combobox = screen.getByRole("combobox")
        await user.click(combobox)

        const popover = screen.getByRole("listbox")
        expect(popover).toBeInTheDocument()

        const optionToSelect = within(popover).getByText("Building Code")
        await user.click(optionToSelect)

        // Verify that the popover has closed
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument()

        // Verify that the button and the hidden input have been updated
        expect(combobox).toHaveTextContent("Building Code")
        const hiddenInput = screen.getByTestId("hidden-localPlan-input")
        expect(hiddenInput).toHaveValue("3")
    })

    it("should filter items when typing in the search field", async () => {
        const user = userEvent.setup()
        render(<LocalPlanSearch fieldName="localPlan" data={mockData} />)

        await user.click(screen.getByRole("combobox"))

        const searchInput = screen.getByPlaceholderText("Search...")
        await user.type(searchInput, "Zoning")

        const list = screen.getByRole("listbox")
        const items = within(list).getAllByRole("option")

        expect(items).toHaveLength(1)
        expect(items[0]).toHaveTextContent("Urban Zoning")
        expect(
            within(list).queryByText("Strategic Master Plan"),
        ).not.toBeInTheDocument()
    })

    it('should display "No item found." message when the search returns no results', async () => {
        const user = userEvent.setup()
        render(<LocalPlanSearch fieldName="localPlan" data={mockData} />)

        await user.click(screen.getByRole("combobox"))

        const searchInput = screen.getByPlaceholderText("Search...")
        await user.type(searchInput, "NonExistentTerm")

        expect(screen.getByText("No item found.")).toBeInTheDocument()
    })

    it("should render correctly with an empty data list", async () => {
        const user = userEvent.setup()
        render(<LocalPlanSearch fieldName="localPlan" data={[]} />)

        await user.click(screen.getByRole("combobox"))

        expect(screen.getByText("No item found.")).toBeInTheDocument()
    })
})
