"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export default function FaturamentoChart({ data }: { data: any[] }) {
  const chartConfig = {
    faturamento: {
      label: "Faturamento",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="mes"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `R$${value / 1000}k`} />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />}
        />
        <Line dataKey="faturamento" type="monotone" stroke="var(--color-faturamento)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  )
}
