import { getLastYearBySystemId } from "@/lib/queries/agreement"
import { getPlans, getPlansType } from "@/lib/queries/plan"
import { render, screen, waitFor } from "@testing-library/react"
import { SystemServicesSearch } from "../SystemServicesSearch"

jest.mock("@/lib/queries/agreement", () => ({
    getLastYearBySystemId: jest.fn(),
}))

jest.mock("@/lib/queries/plan", () => ({
    getPlans: jest.fn(),
}))

jest.mock("../SelectPlan", () => ({
    SelectPlan: ({
        localPlanId,
        exchangeRate,
        data,
    }: {
        localPlanId: string
        exchangeRate: string
        data: getPlansType[]
    }) => (
        <div data-testid="select-plan">
            <input data-testid="local-plan-id" value={localPlanId} readOnly />
            <input data-testid="exchange-rate" value={exchangeRate} readOnly />
            <span data-testid="plans-count">{data.length}</span>
        </div>
    ),
}))

jest.mock("next/form", () => ({
    __esModule: true,
    default: ({
        children,
        ...props
    }: {
        children: React.ReactNode
        [key: string]: any
    }) => <form {...props}>{children}</form>,
}))

const mockPlans = [
    { planId: "plan1", euro: "1.1" },
    { planId: "plan2", euro: "1.2" },
]

const mockLastYear = [{ localPlanId: "plan1" }]

describe("SystemServicesSearch", () => {
    const mockedGetPlans = getPlans as jest.Mock
    const mockedGetLastYearBySystemId = getLastYearBySystemId as jest.Mock
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it("should render with provided localPlanId and exchangeRate", async () => {
        mockedGetPlans.mockResolvedValue(mockPlans)

        const systemId = "system-123"
        const localPlanId = "plan-abc"
        const exchangeRate = "1.5"

        const ResolvedComponent = await SystemServicesSearch({
            systemId,
            localPlanId,
            exchangeRate,
        })
        render(ResolvedComponent)

        await waitFor(() => {
            expect(screen.getByTestId("local-plan-id")).toHaveValue(localPlanId)
            expect(screen.getByTestId("exchange-rate")).toHaveValue(
                exchangeRate,
            )
            expect(screen.getByTestId("plans-count")).toHaveTextContent(
                mockPlans.length.toString(),
            )
        })
    })

    it("should fetch last year's plan when localPlanId is not provided", async () => {
        mockedGetPlans.mockResolvedValue(mockPlans)
        mockedGetLastYearBySystemId.mockResolvedValue(mockLastYear)

        const systemId = "system-123"

        const ResolvedComponent = await SystemServicesSearch({ systemId })
        render(ResolvedComponent)

        await waitFor(() => {
            expect(getLastYearBySystemId).toHaveBeenCalledWith(systemId)
            expect(screen.getByTestId("local-plan-id")).toHaveValue(
                mockLastYear[0].localPlanId,
            )
            expect(screen.getByTestId("exchange-rate")).toHaveValue(
                mockPlans.find((p) => p.planId === mockLastYear[0].localPlanId)
                    ?.euro as string,
            )
        })
    })

    it("should handle errors when fetching data and fallback to defaults", async () => {
        mockedGetPlans.mockRejectedValue(new Error("Failed to fetch plans"))
        mockedGetLastYearBySystemId.mockRejectedValue(
            new Error("Failed to fetch last year"),
        )

        const systemId = "system-123"

        const ResolvedComponent = await SystemServicesSearch({ systemId })
        render(ResolvedComponent)

        await waitFor(() => {
            expect(screen.getByTestId("local-plan-id")).toHaveValue("")
            expect(screen.getByTestId("exchange-rate")).toHaveValue("1")
            expect(screen.getByTestId("plans-count")).toHaveTextContent("0")
        })
    })
})
