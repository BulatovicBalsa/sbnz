import * as React from "react"
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    ReferenceLine, YAxis, Customized, ReferenceArea,
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
import type {FoodAmount, FoodItem, GlucoseSample, TimelineEvent, GlucoseTrend} from "@/types"
import {Separator} from "@/components/ui/separator.tsx";
import FoodHover from "@/components/chart/hover/FoodHover.tsx";
import InsulinHover from "@/components/chart/hover/InsulinHover.tsx";
import ActivityHover from "@/components/chart/hover/ActivityHover.tsx";
import {getTimeNow} from "@/utils/time.ts";

type Pt = { t: number; mmol: number };

function withBoundaryPoint(samples: Pt[], from: number, to: number): Pt[] {
    if (!samples.length) return [];

    // Keep in-window points
    const inside = samples.filter(s => s.t >= from && s.t <= to);

    // Find last sample before 'from'
    let iBefore = -1;
    for (let i = samples.length - 1; i >= 0; i--) {
        if (samples[i].t < from) { iBefore = i; break; }
    }

    if (iBefore >= 0) {
        const leadIn = samples[iBefore];
        const next = samples[iBefore + 1];

        // If there is a next point after 'from', add a synthetic boundary point at 'from'
        if (next && next.t > leadIn.t) {
            const ratio = (from - leadIn.t) / (next.t - leadIn.t);
            const y = leadIn.mmol + ratio * (next.mmol - leadIn.mmol);
            const boundary = { t: from, mmol: +y.toFixed(1) };
            return [boundary, ...inside];
        }

        // Fallback: include the real lead-in point (slightly off-screen)
        return [leadIn, ...inside];
    }

    // No point before window → just return inside
    return inside;
}

type Props = {
    data: GlucoseSample[]
    trend: GlucoseTrend
    simNow?: number // for demo purposes only
    events?: TimelineEvent[] // for insulin markers (not implemented here)
    foodCatalog: FoodItem[]
}

const HOUR_MS = 60 * 60 * 1000;

const chartConfig = {
    glucose: {
        label: "Glucose (mmol/L)",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

const parseActivity = (e: TimelineEvent) => {
    const start = e.at;
    const durationMin = Number(e.duration ?? 0);
    const end = start + durationMin * 60_000;
    const intensity = (e.intensity as "LOW" | "MED" | "HIGH") ?? undefined;
    return { id: e.id, start, end, durationMin, intensity: intensity ?? "LOW" as const };
};

const ACTIVITY_COLORS: Record<"LOW"|"MED"|"HIGH", { stroke: string; fill: string }> = {
    LOW: { stroke: "#10B981", fill: "#10B981" }, // emerald-500
    MED: { stroke: "#F59E0B", fill: "#F59E0B" }, // amber-500
    HIGH:{ stroke: "#EF4444", fill: "#EF4444" }, // red-500
};

export function GlucoseChart({ data, trend, simNow, events, foodCatalog }: Props) {
    const [activeChart] =
        React.useState<keyof typeof chartConfig>("glucose")

    // current value = last glucose
    const current = data.at(-1)?.mmol ?? null

    const insulin = React.useMemo(
      () =>
        (events ?? [])
          .filter(e => e.type === "INSULIN" && (e.amount as number ?? 0) > 0)
          .map(e => ({ id: e.id, at: e.at, units: Number(e.amount) })),
      [events]
    )

    const food = React.useMemo(
        () =>
            (events ?? [])
                .filter(e => e.type === "FOOD")
                .map(e => {
                    const foodAmounts = e.amount as FoodAmount[] | [];
                    const carbs = foodAmounts.map(fa => {
                        const f = foodCatalog.find(fc => fc.id === fa.id);
                        return (f?.carbs ?? 0) * fa.quantity;
                    }).reduce((a, b) => a + b, 0);
                    
                    const fats = foodAmounts.map(fa => {
                        const f = foodCatalog.find(fc => fc.id === fa.id);
                        return (f?.fats ?? 0) * fa.quantity;
                    }).reduce((a, b) => a + b, 0);
                    return { id: e.id, at: e.at, label: e.label as string, carbs, fats };
                }),
        [events, foodCatalog]
    );

    const activities = React.useMemo(
        () =>
            (events ?? [])
                .filter(e => e.type === "ACTIVITY")
                .map(parseActivity)
                .filter(a => a.end > a.start),
        [events]
    );

    const now = simNow ?? getTimeNow();
    const minDomain = now - HOUR_MS;
    const maxDomain = now + HOUR_MS;

    // Add left boundary point so the line continues into the visible window
    const windowed = withBoundaryPoint(
        data.map(d => ({ t: d.t, mmol: d.mmol })),
        minDomain,
        now // we only need continuity on the left side
    );

    const chartData = windowed.map(d => ({ date: d.t, glucose: d.mmol }));

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
                    className="aspect-auto h-[450px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ left: 12, right: 12, bottom: 60 }}
                    >
                    <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            type="number"
                            domain={[
                                minDomain,
                                maxDomain,
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
                                if ((!food?.length && !insulin?.length) && !activities?.length) return null;

                                const { xAxisMap, offset } = props;
                                const xKey = Object.keys(xAxisMap)[0];
                                const xScale = xAxisMap[xKey]?.scale;
                                if (!xScale) return null;

                                // Layout
                                const LANE_HEIGHT = 18;
                                const baseY = offset.top + offset.height + 2;
                                const laneY = (lane: number) => baseY + lane * LANE_HEIGHT;

                                // Clamp x positions to plotting area
                                const xMin = offset.left;
                                const xMax = offset.left + offset.width;
                                const clamp = (x: number) => Math.max(xMin, Math.min(xMax, x));

                                // --- De-overlap helpers for point events (Food/Insulin)
                                const BUCKET_MS = 60 * 1000;
                                const groupByMinute = <T extends { at: number }>(items: T[]) => {
                                    const map = new Map<number, T[]>();
                                    for (const it of items) {
                                        if (it.at < minDomain || it.at > maxDomain) continue;
                                        const k = Math.round(it.at / BUCKET_MS);
                                        (map.get(k) ?? map.set(k, []).get(k)!).push(it);
                                    }
                                    return [...map.values()];
                                };
                                const renderGroup = (items: any[], lane: number, render: (item: any, x: number, y: number, idx: number) => React.ReactNode) => {
                                    const spread = 12;
                                    const y = laneY(lane);
                                    const xs = items.map(it => xScale(it.at)).filter((x: number) => Number.isFinite(x));
                                    if (!xs.length) return null;
                                    const center = xs.reduce((a: number, b: number) => a + b, 0) / xs.length;
                                    const start = center - ((items.length - 1) * spread) / 2;
                                    return items.map((it, i) => render(it, clamp(start + i * spread), y, i));
                                };

                                return (
                                    <g>
                                        {/* Lane 0: INSULIN (icons) */}
                                        {groupByMinute(insulin).map((grp, gi) =>
                                            renderGroup(grp, 0, (it, x, y) => (
                                                <foreignObject
                                                    key={`ins-${it.id}-${gi}`}
                                                    x={x - 11}
                                                    y={y}
                                                    width={16}
                                                    height={16}
                                                    style={{ overflow: "visible", pointerEvents: "auto" }}
                                                >
                                                    <InsulinHover at={it.at} units={it.units} />
                                                </foreignObject>
                                            ))
                                        )}

                                        {/* Lane 1: FOOD (icons) */}
                                        {groupByMinute(food).map((grp, gi) =>
                                            renderGroup(grp, 1, (it, x, y) => (
                                                <foreignObject
                                                    key={`food-${it.id}-${gi}`}
                                                    x={x - 11}
                                                    y={y}
                                                    width={16}
                                                    height={16}
                                                    style={{ overflow: "visible", pointerEvents: "auto" }}
                                                >
                                                    <FoodHover at={it.at} carbs={it.carbs} fats={it.fats} />
                                                </foreignObject>
                                            ))
                                        )}

                                        {/* Lane 2: ACTIVITY (interval bar) */}
                                        {activities.map(a => {
                                            if (a.end < minDomain || a.start > maxDomain) return null;
                                            const x1 = clamp(xScale(a.start));
                                            const x2 = clamp(xScale(a.end));
                                            const width = Math.max(8, x2 - x1);
                                            const y = laneY(2) + (LANE_HEIGHT - 8) / 2; // center a 8px bar
                                            const color = ACTIVITY_COLORS[a.intensity].fill;
                                            return (
                                                <foreignObject
                                                    key={`act-${a.id}`}
                                                    x={x1}
                                                    y={y}
                                                    width={width}
                                                    height={8}
                                                    style={{ overflow: "visible", pointerEvents: "auto" }}
                                                >
                                                    <ActivityHover
                                                        start={a.start}
                                                        end={a.end}
                                                        intensity={a.intensity}
                                                        durationMin={a.durationMin}
                                                        color={color}
                                                    />
                                                </foreignObject>
                                            );
                                        })}
                                    </g>
                                );
                            }}
                        />

                        {insulin.map(i => {
                            if (i.at < minDomain || i.at > maxDomain) return null;
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
                            if (f.at < minDomain || f.at > maxDomain) return null;
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

                        {activities.map(a => {
                            const color = ACTIVITY_COLORS[a.intensity];
                            return (
                                <ReferenceArea
                                    key={`band-${a.id}`}
                                    x1={a.start}
                                    x2={a.end}
                                    y1={1.9}
                                    y2={23.0}
                                    stroke={color.stroke}
                                    strokeOpacity={0.4}
                                    fill={color.fill}
                                    fillOpacity={0.12}
                                />
                            );
                        })}

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