import { render, screen } from "@testing-library/react"
import { ServiceSearch } from "../ServiceSearch"
import { getPlansForSearch } from "@/lib/queries/plan"

// Mock the 'next/form' component to render a standard form element
jest.mock("next/form", () => {
    // eslint-disable-next-line
    return ({ children, ...props }: any) => (
        <form {...props} data-testid="service-search-form">
            {children}
        </form>
    )
})

// Mock the async data fetching function
jest.mock("@/lib/queries/plan", () => ({
    getPlansForSearch: jest.fn(),
}))

// Mock child components to isolate the component under test
jest.mock("@/app/components/LocalPlanSearch", () => ({
    LocalPlanSearch: jest.fn(({ defaultValue }) => (
        <select defaultValue={defaultValue} data-testid="local-plan-select">
            <option value="">All Plans</option>
            {/* Add an option for the defaultValue if it exists, so .toHaveValue() works */}
            {defaultValue && (
                <option value={defaultValue}>Plan: {defaultValue}</option>
            )}
        </select>
    )),
}))

jest.mock("@/app/components/SearchButton", () => ({
    SearchButton: () => <button>Search</button>,
}))

describe("ServiceSearch", () => {
    const mockPlans = [{ id: "plan-1", name: "Plan 1" }]
    const mockGetPlansForSearch = getPlansForSearch as jest.Mock

    beforeEach(() => {
        // Provide a mock resolved value for the async function
        mockGetPlansForSearch.mockResolvedValue(mockPlans)
    })

    it("should render the search form with default values", async () => {
        // Since ServiceSearch is an async component, we must await it to resolve
        // before passing it to the render function.
        const ResolvedServiceSearch = await ServiceSearch({})
        render(ResolvedServiceSearch)

        expect(
            screen.getByPlaceholderText("Search Services"),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Search" }),
        ).toBeInTheDocument()
        expect(screen.getByRole("combobox")).toBeInTheDocument() // from LocalPlanSearch mock
    })

    it("should render with initial search text and local plan id", async () => {
        const searchText = "test service"
        const localPlanId = "plan-123"

        const ResolvedServiceSearch = await ServiceSearch({
            searchText,
            localPlanId,
        })
        render(ResolvedServiceSearch)

        const searchInput = screen.getByPlaceholderText("Search Services")
        expect(searchInput).toHaveValue(searchText)

        expect(screen.getByTestId("local-plan-select")).toHaveValue(localPlanId)
    })
})
