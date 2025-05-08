import { getSession } from "@/lib/auth"
import { getPlans } from "@/lib/queries/plan"
import { PlanForm } from "./PlanForm"

export const metadata = {
    title: "Company Plans",
}

export default async function PlansPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams
    const { plans } = params
    await getSession("/plans", params)

    if (plans) {
        return <p className="mt-4">Plans filter is not allowed yet.</p>
    }

    try {
        const results = await getPlans()

        return (
            <div>
                <PlanForm plans={results} />
            </div>
        )
    } catch (error) {
        if (error instanceof Error) {
            return <p className="mt-4">Error: ${error.message}</p>
        }

        return <p className="mt-4">Unexpected error</p>
    }
}
