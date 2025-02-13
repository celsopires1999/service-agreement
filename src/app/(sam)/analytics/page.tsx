import { CardFooter } from "@/components/ui/card"
import { ChartConfig } from "@/components/ui/chart"
import { getAnalyticsPlans } from "@/lib/queries/analyticsPlan"
import { TrendingUp } from "lucide-react"
import { AgreementChart } from "./AgreementChart"
import { PlanChart } from "./PlanChart"

export const metadata = {
    title: "Analytics",
}

export default async function AnalyticsPlansPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    await searchParams

    const chartAgreementConfig = {
        revised: {
            label: "Revised",
            color: "hsl(var(--chart-1))",
        },
        inProgress: {
            label: "In Progress",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig

    try {
        const result = await getAnalyticsPlans()

        const chartAgreementData = result.map((item) => ({
            plan: item.code,
            revised: item.agreementsRevisedCount,
            inProgress: item.agreementsInProgressCount,
            total: item.agreementsCount,
        }))

        return (
            <div className="flex flex-row gap-4">
                <PlanChart
                    chartConfig={chartAgreementConfig}
                    chartData={chartAgreementData}
                    title="Agreements"
                    description="Number of agreements per Local Plan"
                    dataKeyX="plan"
                    dataKeyBar1="revised"
                    dataKeyBar2="inProgress"
                    unit="Docs"
                >
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                        <div className="flex gap-2 font-medium leading-none">
                            Trending up by 5.2% this month{" "}
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="leading-none text-muted-foreground">
                            Showing total visitors for the last 6 months
                        </div>
                    </CardFooter>
                </PlanChart>

                <AgreementChart
                    chartConfig={chartAgreementConfig}
                    chartData={chartAgreementData}
                    title="Agreements"
                    description="Number of agreements per Local Plan"
                    dataKeyX="plan"
                    dataKeyBar1="revised"
                    dataKeyBar2="inProgress"
                >
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                        <div className="flex gap-2 font-medium leading-none">
                            Trending up by 5.2% this month{" "}
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="leading-none text-muted-foreground">
                            Showing total visitors for the last 6 months
                        </div>
                    </CardFooter>
                </AgreementChart>
            </div>
        )
    } catch (error) {
        if (error instanceof Error) {
            return <p className="mt-4">Error: ${error.message}</p>
        }

        return <p className="mt-4">Unexpected error</p>
    }
}
