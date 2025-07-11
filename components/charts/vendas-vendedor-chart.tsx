"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export default function VendasVendedorChart({ data }: { data: any[] }) {
  const chartConfig = {
    vendas: {
      label: "Vendas",
      color: "hsl(var(--chart-2))",
    },
    faturamento: {
      label: "Faturamento",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="vendedor"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => [
                  name === "faturamento"
                    ? `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                    : value,
                  name === "faturamento" ? "Faturamento" : "Vendas",
                ]}
              />
            }
          />
          <Bar dataKey="vendas" fill="var(--color-vendas)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
