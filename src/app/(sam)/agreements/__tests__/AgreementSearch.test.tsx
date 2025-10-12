import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AgreementSearch } from "../AgreementSearch"
import { useRouter, useSearchParams } from "next/navigation"

// Mock next/navigation hooks
const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.Mock
const mockUseSearchParams = useSearchParams as jest.Mock

// Mock child components
jest.mock("@/app/components/LocalPlanSearch", () => ({
    LocalPlanSearch: jest.fn(({ defaultValue, fieldName }) => (
        <select
            defaultValue={defaultValue}
            data-testid="local-plan-select"
            name={fieldName}
        >
            <option value="">All Plans</option>
            <option value="plan-1">Plan 1</option>
            <option value="plan-2">Plan 2</option>
        </select>
    )),
}))

jest.mock("@/app/components/SearchButton", () => ({
    SearchButton: () => <button type="submit">Search</button>,
}))

describe("AgreementSearch", () => {
    const mockPlans = [
        { id: "plan-1", description: "Plan 1" },
        { id: "plan-2", description: "Plan 2" },
    ]

    beforeEach(() => {
        // jest.setup.ui.ts handles the mock implementation
        mockUseRouter.mockReturnValue({ push: mockPush })
        mockUseSearchParams.mockReturnValue(new URLSearchParams())
        mockPush.mockClear()
    })

    it("should render the search form with default values", () => {
        render(<AgreementSearch data={mockPlans} />)

        expect(
            screen.getByPlaceholderText("Search Agreements"),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Search" }),
        ).toBeInTheDocument()
        expect(screen.getByTestId("local-plan-select")).toBeInTheDocument()
    })

    it("should render with initial search text and local plan id", () => {
        const searchText = "test agreement"
        const localPlanId = "plan-1"

        render(
            <AgreementSearch
                data={mockPlans}
                searchText={searchText}
                localPlanId={localPlanId}
            />,
        )

        expect(screen.getByPlaceholderText("Search Agreements")).toHaveValue(
            searchText,
        )
        expect(screen.getByTestId("local-plan-select")).toHaveValue(localPlanId)
    })

    it("should call router.push with correct params on form submission", async () => {
        mockUseSearchParams.mockReturnValue(
            new URLSearchParams("filterToggle=true"),
        )
        render(<AgreementSearch data={mockPlans} />)
        const user = userEvent.setup()

        const searchInput = screen.getByPlaceholderText("Search Agreements")
        const planSelect = screen.getByTestId("local-plan-select")
        const searchButton = screen.getByRole("button", { name: /search/i })

        // Simulate user input
        await user.type(searchInput, "new search")
        await user.selectOptions(planSelect, "plan-2")

        // Simulate form submission by clicking the button
        await user.click(searchButton)

        expect(mockPush).toHaveBeenCalledTimes(1)
        expect(mockPush).toHaveBeenCalledWith(
            "/agreements?filterToggle=true&localPlanId=plan-2&searchText=new+search&page=1",
        )
    })
})
