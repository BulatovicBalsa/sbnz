// src/components/GlucoseChart.tsx
import * as React from "react"
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    ReferenceLine, YAxis, Customized,
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
import FoodHover from "@/components/chart/hover/FoodHover.tsx";
import InsulinHover from "@/components/chart/hover/InsulinHover.tsx";

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

    // Parse "... 34g carbs • 12.5g fats" from FoodEvent label (fallback if amount isn't set)
    const parseFoodMacrosFromLabel = (label?: string) => {
        if (!label) return { carbs: undefined as number | undefined, fats: undefined as number | undefined };
        const carbs = label.match(/([\d.]+)\s*g\s*carbs/i)?.[1];
        const fats  = label.match(/([\d.]+)\s*g\s*fats?/i)?.[1];
        return { carbs: carbs ? Number(carbs) : undefined, fats: fats ? Number(fats) : undefined };
    };

    const food = React.useMemo(
        () =>
            (events ?? [])
                .filter(e => e.type === "FOOD")
                .map(e => {
                    const parsed = parseFoodMacrosFromLabel(e.label as string);
                    // if your FoodEventDialog stored total carbs in e.amount, prefer that:
                    const carbs = Number.isFinite(Number(e.amount)) ? Number(e.amount) : parsed.carbs;
                    return { id: e.id, at: e.at, label: e.label as string, carbs, fats: parsed.fats };
                }),
        [events]
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

                        <Customized
                            component={(props: any) => {
                                if (!food.length && !insulin.length) return null;
                                const { xAxisMap, offset } = props;
                                const xKey = Object.keys(xAxisMap)[0];
                                const xScale = xAxisMap[xKey]?.scale;
                                if (!xScale) return null;

                                const baseY = offset.top + offset.height; // X-axis baseline

                                return (
                                    <g>
                                        {/* Food icons */}
                                        {food.map(f => {
                                            const x = xScale(f.at);
                                            if (x == null || Number.isNaN(x)) return null;
                                            return (
                                                <foreignObject
                                                    key={`food-${f.id}`}
                                                    x={x - 8}
                                                    y={baseY + 2}
                                                    width={16}
                                                    height={16}
                                                    style={{ overflow: "visible", pointerEvents: "auto" }}
                                                >
                                                    <FoodHover at={f.at} carbs={f.carbs} fats={f.fats} />
                                                </foreignObject>
                                            );
                                        })}

                                        {/* Insulin icons */}
                                        {insulin.map(i => {
                                            const x = xScale(i.at);
                                            if (x == null || Number.isNaN(x)) return null;
                                            return (
                                                <foreignObject
                                                    key={`ins-${i.id}`}
                                                    x={x - 8}
                                                    y={baseY + 24}
                                                    width={16}
                                                    height={16}
                                                    style={{ overflow: "visible", pointerEvents: "auto" }}
                                                >
                                                    <InsulinHover at={i.at} units={i.units} />
                                                </foreignObject>
                                            );
                                        })}
                                    </g>
                                );
                            }}
                        />

                        {insulin.map(i => {
                            if (i.at < simNow - 60 * 60 * 1000 || i.at > simNow + 60 * 60 * 1000) return null;
                            return (
                                <ReferenceLine
                                    key={i.id}
                                    x={i.at}
                                    stroke="#8B5CF6"
                                    strokeDasharray="4 4"
                                    ifOverflow="extendDomain"
                                    label={{ value: `${i.units}U`, position: "top", fill: "#8B5CF6", fontSize: 11 }}
                                />
                            )}
                        )}

                        {food.map(f => {
                            if (f.at < simNow - 60 * 60 * 1000 || f.at > simNow + 60 * 60 * 1000) return null;
                            return (
                                <ReferenceLine
                                    key={f.id}
                                    x={f.at}
                                    stroke="orange"
                                    strokeDasharray="4 4"
                                    ifOverflow="extendDomain"
                                />
                            )})
                        }

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
            </CardContent>
        </Card>
    )
}