import { getPlans } from "@/lib/queries/plan"
import { PlanForm } from "./PlanForm"

export const metadata = {
    title: "Company Plans",
}

export default async function PlansPage() {
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
