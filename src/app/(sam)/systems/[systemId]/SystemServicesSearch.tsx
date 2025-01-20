import { SearchButton } from "@/components/SearchButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getLastYearBySystemId } from "@/lib/queries/agreement"
import { getCurrency } from "@/lib/queries/currency"
import { getPlans } from "@/lib/queries/plan"
import Form from "next/form"
import { SelectPlan } from "./SelectPlan"

type Props = {
    systemId: string
    year?: string
    exchangeRate?: string
    localPlanId?: string
}
export async function SystemServicesSearch({
    systemId,
    year,
    exchangeRate,
    localPlanId,
}: Props) {
    let searchYear: string
    let searchLocalPlanId: string
    let searchExchangeRate: string
    let plans: { id: string; description: string }[]

    try {
        const result = await getPlans()
        if (result) {
            plans = result.map((plan) => ({
                id: plan.planId,
                description: plan.code,
            }))
        } else {
            plans = []
        }
    } catch (error) /* eslint-disable-line  @typescript-eslint/no-unused-vars */ {
        plans = []
    }

    if (year) {
        searchYear = year
    } else {
        try {
            const result = await getLastYearBySystemId(systemId)
            searchYear = result[0].year.toString()
        } catch (error) /* eslint-disable-line  @typescript-eslint/no-unused-vars */ {
            searchYear = new Date().getFullYear().toString()
        }
    }

    if (localPlanId) {
        searchLocalPlanId = localPlanId
    } else {
        searchLocalPlanId = ""
    }

    if (exchangeRate) {
        searchExchangeRate = exchangeRate
    } else {
        try {
            const result = await getCurrency(+searchYear, "EUR")
            searchExchangeRate = result[0].value
        } catch (error) /* eslint-disable-line  @typescript-eslint/no-unused-vars */ {
            searchExchangeRate = "1"
        }
    }

    return (
        <Form
            action={`/systems/${systemId}`}
            className="flex items-center gap-10"
        >
            <div className="flex items-center gap-2 align-middle">
                <Label htmlFor="year">Year</Label>
                <Input
                    type="number"
                    min="2024"
                    max="2124"
                    name="year"
                    placeholder="Year"
                    defaultValue={searchYear}
                    autoFocus
                    className="w-24"
                />
            </div>

            <SelectPlan localPlanId={searchLocalPlanId} data={plans} />

            <div className="flex items-center gap-2">
                <Label htmlFor="exchangeRate">EUR / USD</Label>
                <Input
                    type="number"
                    min="0.0001"
                    max="1000"
                    step="0.0001"
                    name="exchangeRate"
                    placeholder="Exchange Rate"
                    defaultValue={searchExchangeRate}
                    className="w-24"
                />
                <SearchButton />
            </div>
        </Form>
    )
}
