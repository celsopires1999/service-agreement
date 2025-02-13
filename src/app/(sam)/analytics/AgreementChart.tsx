"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

type Props = {
    title: string
    description: string
    chartConfig: ChartConfig
    chartData: unknown[]
    dataKeyX: string
    dataKeyBar1: string
    dataKeyBar2: string
    children?: React.ReactNode
}

export function AgreementChart({
    title,
    description,
    chartConfig,
    chartData,
    dataKeyX,
    dataKeyBar1,
    dataKeyBar2,
    children,
}: Props) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey={dataKeyX}
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 10)}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                            dataKey={dataKeyBar1}
                            stackId="a"
                            fill={`var(--color-${dataKeyBar1})`}
                            radius={[0, 0, 4, 4]}
                        />
                        <Bar
                            dataKey={dataKeyBar2}
                            stackId="a"
                            fill={`var(--color-${dataKeyBar2})`}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            {children}
        </Card>
    )
}
