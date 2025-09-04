// src/components/GlucoseChart.tsx
import * as React from "react"
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    ReferenceLine,
} from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import type { GlucoseSample } from "@/types"

type Props = {
    data: GlucoseSample[]
    trend: "↑" | "↓" | "→" // backend-provided
    simNow: number // for demo purposes only
}

const chartConfig = {
    glucose: {
        label: "Current Glucose",
        color: "var(--chart-1)",
    },
    trend: {
        label: "Trend",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function GlucoseChart({ data, trend, simNow }: Props) {
    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>("glucose")

    // just for demo — you can swap this for backend-processed arrays
    const chartData = data.map((d) => ({
        date: d.t,
        glucose: d.mmol,
        trend: 1, // dummy series just to render a flat line
    }))

    // current value = last glucose
    const current = data.at(-1)?.mmol ?? null

    return (
        <Card className="py-4 sm:py-0">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                    <CardTitle>Glucose Overview</CardTitle>
                    <CardDescription>Realtime CGM with trend</CardDescription>
                </div>
                <div className="flex">
                    {(["glucose", "trend"] as const).map((key) => {
                        return (
                            <button
                                key={key}
                                data-active={activeChart === key}
                                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                                onClick={() => setActiveChart(key)}
                            >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[key].label}
                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {key === "glucose"
                      ? current?.toFixed(1) ?? "--"
                      : trend}
                </span>
                            </button>
                        )
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            type="number"
                            domain={[
                                simNow - 60 * 60 * 1000,
                                simNow + 60 * 60 * 1000,
                            ]}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) =>
                                new Date(value).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })
                            }
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    labelKey="date"
                                    labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                                />
                            }
                        />
                        <Line
                            dataKey={activeChart}
                            type="monotone"
                            stroke={`var(--color-primary)`}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                        {/* thresholds */}
                        <ReferenceLine
                            y={3.9}
                            stroke="red"
                            strokeDasharray="4 4"
                            label="3.9"
                        />
                        <ReferenceLine
                            y={9.9}
                            stroke="gold"
                            strokeDasharray="4 4"
                            label="9.9"
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}