// src/components/GlucoseChart.tsx
import * as React from "react"
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    ReferenceLine, YAxis,
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
} from "@/components/ui/chart"
import type { GlucoseSample, TimelineEvent  } from "@/types"
import {Separator} from "@/components/ui/separator.tsx";

type Props = {
    data: GlucoseSample[]
    trend: "↑" | "↓" | "→" // backend-provided
    simNow: number // for demo purposes only
    events?: TimelineEvent[] // for insulin markers (not implemented here)
}

const chartConfig = {
    glucose: {
        label: "Glucose (mmol/L)",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

const formatClock = (t: number) =>
    new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function GlucoseChart({ data, trend, simNow, events }: Props) {
    const [activeChart] =
        React.useState<keyof typeof chartConfig>("glucose")

    // just for demo — you can swap this for backend-processed arrays
    const chartData = data.map((d) => ({
        date: d.t,
        glucose: d.mmol,
    }))

    // current value = last glucose
    const current = data.at(-1)?.mmol ?? null

    const insulin = React.useMemo(
      () =>
        (events ?? [])
          .filter(e => e.type === "INSULIN" && (e.amount ?? 0) > 0)
          .map(e => ({ id: e.id, at: e.at, units: Number(e.amount) })),
      [events]
    )

    // hovered timestamp (x)
    const [hoverTs, setHoverTs] = React.useState<number | null>(null);

    // insulin near hovered x (±5 minutes)
    const NEAR_MS = 5 * 60 * 1000;
    const nearInsulin = React.useMemo(
        () =>
            hoverTs == null
                ? []
                : insulin
                    .filter(i => Math.abs(i.at - hoverTs) <= NEAR_MS)
                    .sort((a, b) => a.at - b.at),
        [NEAR_MS, hoverTs, insulin]
    );

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
                                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                            >
                                <span className="text-muted-foreground text-xs">
                                  {key === "glucose" ? "Glucose (mmol/L)" : "Trend"}
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
                        onMouseMove={(state) => {
                            // activeLabel is the numeric X (timestamp) when XAxis type="number"
                            if (state && typeof state.activeLabel === "number") {
                                setHoverTs(state.activeLabel);
                            }
                        }}
                        onMouseLeave={() => setHoverTs(null)}
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
                            tickFormatter={(value) => {
                                // Ensure value is a valid timestamp
                                const date = new Date(value);
                                return date.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });
                            }}
                        />
                        <YAxis domain={[1.9, 23.0]} ticks={[3, 6, 9, 12, 15, 18, 21]} />
                        <ChartTooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;

                                // Prefer the original numeric timestamp from the row
                                const ts =
                                    Number(payload[0]?.payload?.date ?? payload[0]?.payload?.t ?? label);

                                const timeStr = Number.isFinite(ts)
                                    ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                    : "—";

                                const value = payload[0]?.value as number | string | undefined;

                                return (
                                    <Card className="pointer-events-none border shadow-md">
                                        <CardContent className="p-3">
                                            <div className="text-xs text-muted-foreground">Time</div>
                                            <div className="text-sm font-medium">{timeStr}</div>

                                            <Separator className="my-2" />

                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    {/* color swatch matches the series color */}
                                                    <span
                                                        className="inline-block h-2 w-2 rounded-full"
                                                        style={{ background: "var(--color-glucose)" }}
                                                        aria-hidden
                                                    />
                                                    <span className="text-xs text-muted-foreground">Glucose</span>
                                                </div>
                                                <div className="font-mono tabular-nums text-sm">
                                                    {value ?? "—"} <span className="text-xs">mmol/L</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            }}
                        />

                        {insulin.map(i => (
                            <ReferenceLine
                                key={i.id}
                                x={i.at}
                                stroke="#8B5CF6"
                                strokeDasharray="4 4"
                                ifOverflow="extendDomain"
                                label={{ value: `${i.units}U`, position: "top", fill: "#8B5CF6", fontSize: 11 }}
                            />
                        ))}

                        <Line
                            dataKey={activeChart}
                            type="monotone"
                            stroke={`var(--color-${activeChart})`}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                        {/* thresholds */}
                        <ReferenceLine
                            y={3.9}
                            stroke="red"
                            strokeDasharray="4 4"
                        />
                        <ReferenceLine
                            y={9.9}
                            stroke="gold"
                            strokeDasharray="4 4"
                        />
                    </LineChart>
                </ChartContainer>

                {/* Bottom insulin info bar */}
                <div className="mt-2 text-xs text-muted-foreground">
                    {hoverTs == null ? (
                        <span>Hover the chart to see insulin near a time.</span>
                    ) : nearInsulin.length === 0 ? (
                        <span>{formatClock(hoverTs)} — no insulin in ±5 min.</span>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="opacity-80">{formatClock(hoverTs)}</span>
                            {nearInsulin.map(i => (
                                <span
                                    key={i.id}
                                    className="rounded-full border px-2 py-0.5"
                                    title={`at ${formatClock(i.at)}`}
                                    style={{ borderColor: "#8B5CF6", color: "#8B5CF6" }}
                                >
                                  {i.units}U @ {formatClock(i.at)}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    )
}