import { getLastYearBySystemId } from "@/lib/queries/agreement"
import { getPlans, getPlansType } from "@/lib/queries/plan"
import Form from "next/form"
import { SelectPlan } from "./SelectPlan"

type Props = {
    systemId: string
    localPlanId?: string
    exchangeRate?: string
}
export async function SystemServicesSearch({
    systemId,
    localPlanId,
    exchangeRate,
}: Props) {
    let searchLocalPlanId: string
    let searchExchangeRate: string
    let plans: getPlansType[]

    try {
        plans = await getPlans()
    } catch {
        plans = []
    }

    if (localPlanId) {
        searchLocalPlanId = localPlanId
        searchExchangeRate = exchangeRate ?? "1"
    } else {
        try {
            const result = await getLastYearBySystemId(systemId)
            searchLocalPlanId = result[0].localPlanId
            searchExchangeRate =
                plans.find((item) => item.planId === searchLocalPlanId)?.euro ??
                "1"
        } catch {
            searchLocalPlanId = ""
            searchExchangeRate = "1"
        }
    }

    return (
        <Form
            action={`/systems/${systemId}`}
            className="flex items-center gap-10"
        >
            <SelectPlan
                localPlanId={searchLocalPlanId}
                exchangeRate={searchExchangeRate}
                data={plans}
            />
        </Form>
    )
}
