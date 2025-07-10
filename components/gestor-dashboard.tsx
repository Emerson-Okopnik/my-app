import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { DollarSign, Package, Users, ArrowUpRight } from "lucide-react"
import FaturamentoChart from "@/components/faturamento-chart"
import VendasVendedorChart from "@/components/vendas-vendedor-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileCheck } from "lucide-react";

type DashboardData = {
  totalFaturamento: number
  totalPropostas: number
  totalVendas: number
  totalVendasFaturadas: number
  taxaConversao: number
  faturamentoMensal: { mes: string; faturamento: number }[]
  vendasPorVendedor: { vendedor: string; vendas: number }[]
}

export default function GestorDashboard({ data }: { data: DashboardData | null }) {
  if (!data) return null

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {data.totalFaturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Vendas com faturamento gerado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalVendas}</div>
            <p className="text-xs text-muted-foreground">Total de vendas no período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propostas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPropostas}</div>
            <p className="text-xs text-muted-foreground">Total de propostas criadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.taxaConversao}%</div>
            <p className="text-xs text-muted-foreground">Propostas convertidas em vendas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
            <CardDescription>Evolução do faturamento nos últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <FaturamentoChart data={data.faturamentoMensal} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Vendas por Vendedor</CardTitle>
            <CardDescription>Ranking de vendas no período</CardDescription>
          </CardHeader>
          <CardContent>
            <VendasVendedorChart data={data.vendasPorVendedor} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Faturadas</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalVendasFaturadas}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalVendas > 0
                ? `${((data.totalVendasFaturadas / data.totalVendas) * 100).toFixed(1)}% das vendas`
                : "Nenhuma venda no período"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {data.totalVendas > 0
                ? (data.totalFaturamento / data.totalVendas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                : "0,00"}
            </div>
            <p className="text-xs text-muted-foreground">Valor médio por venda</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
