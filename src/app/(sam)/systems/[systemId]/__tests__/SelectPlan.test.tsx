import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SelectPlan } from "../SelectPlan"
import { getPlansType } from "@/lib/queries/plan"

const mockPlans: getPlansType[] = [
    {
        planId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        code: "Basic Plan",
        euro: "10.0000",
        description: "Basic features",
        planDate: new Date().toISOString(),
    },
    {
        planId: "b2c3d4e5-f6a7-8901-2345-67890abcdef1",
        code: "Pro Plan",
        euro: "25.0000",
        description: "Pro features",
        planDate: new Date().toISOString(),
    },
    {
        planId: "c3d4e5f6-a7b8-9012-3456-7890abcdef12",
        code: "Enterprise Plan",
        euro: "50.0000",
        description: "All features",
        planDate: new Date().toISOString(),
    },
]

describe("SelectPlan", () => {
    it("renders the select with a placeholder when no value is provided", () => {
        render(<SelectPlan data={mockPlans} />)

        expect(screen.getByRole("combobox")).toBeInTheDocument()
        expect(screen.getByText("Select")).toBeInTheDocument()
    })

    it("renders with a pre-selected value", () => {
        render(
            <SelectPlan
                data={mockPlans}
                localPlanId={mockPlans[1].planId}
                exchangeRate={mockPlans[1].euro}
            />,
        )

        expect(screen.getByRole("combobox")).toHaveTextContent("Pro Plan")
    })

    it("opens the dropdown and displays all plan options on click", async () => {
        const user = userEvent.setup()
        render(<SelectPlan data={mockPlans} />)

        const trigger = screen.getByRole("combobox")
        await user.click(trigger)

        expect(
            screen.getByRole("option", { name: "Basic Plan" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("option", { name: "Pro Plan" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("option", { name: "Enterprise Plan" }),
        ).toBeInTheDocument()
    })

    it("updates hidden fields when an option is selected", async () => {
        const user = userEvent.setup()
        render(<SelectPlan data={mockPlans} />)

        await user.click(screen.getByRole("combobox"))

        await user.click(
            screen.getByRole("option", { name: "Enterprise Plan" }),
        )

        expect(screen.getByRole("combobox")).toHaveTextContent(
            "Enterprise Plan",
        )
        const localPlanIdInput = screen.getByDisplayValue(
            "c3d4e5f6-a7b8-9012-3456-7890abcdef12",
        ) as HTMLInputElement
        const exchangeRateInput = screen.getByDisplayValue(
            "50.0000",
        ) as HTMLInputElement

        expect(localPlanIdInput.value).toBe(mockPlans[2].planId)
        expect(localPlanIdInput).toHaveAttribute("name", "localPlanId")
        expect(exchangeRateInput.value).toBe(mockPlans[2].euro)
        expect(exchangeRateInput).toHaveAttribute("name", "exchangeRate")
    })
})
