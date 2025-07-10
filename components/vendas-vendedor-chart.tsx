"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export default function VendasVendedorChart({ data }: { data: any[] }) {
  const chartConfig = {
    vendas: {
      label: "Vendas",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="vendedor" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="vendas" fill="var(--color-vendas)" radius={8} />
      </BarChart>
    </ChartContainer>
  )
}
