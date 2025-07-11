"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export default function FaturamentoChart({ data }: { data: any[] }) {
  const chartConfig = {
    faturamento: {
      label: "Faturamento",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="mes"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [
                  `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                  "Faturamento",
                ]}
              />
            }
          />
          <Line
            dataKey="faturamento"
            type="monotone"
            stroke="var(--color-faturamento)"
            strokeWidth={3}
            dot={{ fill: "var(--color-faturamento)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
