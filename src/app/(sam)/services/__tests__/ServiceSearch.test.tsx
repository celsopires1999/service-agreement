import { render, screen, fireEvent } from "@testing-library/react"
import { ServiceSearch } from "../ServiceSearch"
import { useRouter, useSearchParams } from "next/navigation"

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.Mock
const mockUseSearchParams = useSearchParams as jest.Mock

interface Plan {
    id: string
    description: string
}

jest.mock("@/app/components/LocalPlanSearch", () => ({
    LocalPlanSearch: jest.fn(({ defaultValue, data }) => (
        <select name="localPlanId" defaultValue={defaultValue} data-testid="local-plan-select">
            <option value="">All Plans</option>
            {data.map((plan: Plan) => (
                <option key={plan.id} value={plan.id}>
                    {plan.description}
                </option>
            ))}
        </select>
    )),
}))

jest.mock("@/app/components/SearchButton", () => ({
    SearchButton: () => <button type="submit">Search</button>,
}))

describe("ServiceSearch", () => {
    const mockPlans: Plan[] = [
        { id: "plan-1", description: "Plan 1" },
        { id: "plan-2", description: "Plan 2" },
    ]

    beforeEach(() => {
        mockUseRouter.mockReturnValue({ push: mockPush })
        mockUseSearchParams.mockReturnValue(new URLSearchParams())
        jest.clearAllMocks()
    })

    it("should render the search form with default values", () => {
        render(<ServiceSearch data={mockPlans} />)

        expect(screen.getByPlaceholderText("Search Services")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument()
        expect(screen.getByTestId("local-plan-select")).toBeInTheDocument()
    })

    it("should render with initial search text and local plan id", () => {
        const searchText = "test service"
        const localPlanId = "plan-1"

        render(
            <ServiceSearch
                data={mockPlans}
                searchText={searchText}
                localPlanId={localPlanId}
            />,
        )

        const searchInput = screen.getByPlaceholderText("Search Services")
        expect(searchInput).toHaveValue(searchText)

        expect(screen.getByTestId("local-plan-select")).toHaveValue(localPlanId)
    })

    it("should call router.push with correct params on form submission", () => {
        render(<ServiceSearch data={mockPlans} />)

        const searchInput = screen.getByPlaceholderText("Search Services")
        const planSelect = screen.getByTestId("local-plan-select")
        const form = searchInput.closest("form")

        fireEvent.change(searchInput, { target: { value: "new search" } })
        fireEvent.change(planSelect, { target: { value: "plan-2" } })

        if (form) {
            fireEvent.submit(form)
        }

        expect(mockPush).toHaveBeenCalledWith(
            `/services?localPlanId=plan-2&searchText=new+search&page=1`,
        )
    })

    it("should preserve existing URL search params on form submission", () => {
        mockUseSearchParams.mockReturnValue(new URLSearchParams("filter=%5B%5D&sort=%5B%5D"));

        render(<ServiceSearch data={mockPlans} />)

        const searchInput = screen.getByPlaceholderText("Search Services")
        const form = searchInput.closest("form")

        fireEvent.change(searchInput, { target: { value: "another search" } })

        if (form) {
            fireEvent.submit(form)
        }

        expect(mockPush).toHaveBeenCalledWith(
            `/services?filter=%5B%5D&sort=%5B%5D&localPlanId=&searchText=another+search&page=1`,
        )
    });
})

