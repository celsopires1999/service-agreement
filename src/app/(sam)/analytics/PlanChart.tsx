"use client"

import { Bar, BarChart, XAxis } from "recharts"

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
    unit?: string
    children?: React.ReactNode
}

export function PlanChart({
    title,
    description,
    chartConfig,
    chartData,
    dataKeyX,
    dataKeyBar1,
    dataKeyBar2,
    unit,
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
                        <XAxis
                            dataKey={dataKeyX}
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 10)}
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
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    className="w-[180px]"
                                    formatter={(value, name, item, index) => (
                                        <>
                                            <div
                                                className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                                                style={
                                                    {
                                                        "--color-bg": `var(--color-${name})`,
                                                    } as React.CSSProperties
                                                }
                                            />
                                            {chartConfig[
                                                name as keyof typeof chartConfig
                                            ]?.label || name}
                                            <div className="ml-auto flex items-baseline gap-1.5 font-mono font-medium tabular-nums text-foreground">
                                                {value}
                                                {unit && (
                                                    <span className="font-normal text-muted-foreground">
                                                        {unit}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Add this after the last item */}
                                            {index === 1 && (
                                                <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                                                    Total
                                                    <div className="ml-auto flex items-baseline gap-1.5 font-mono font-medium tabular-nums text-foreground">
                                                        {item.payload.total}
                                                        <span className="font-normal text-muted-foreground">
                                                            {unit}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                />
                            }
                            cursor={false}
                            defaultIndex={1}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            {children}
        </Card>
    )
}
