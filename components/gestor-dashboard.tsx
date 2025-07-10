import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { DollarSign, Package, Users, ArrowUpRight } from "lucide-react"
import FaturamentoChart from "@/components/faturamento-chart"
import VendasVendedorChart from "@/components/vendas-vendedor-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type DashboardData = {
  totalFaturamento: number
  totalPropostas: number
  totalVendas: number
  taxaConversao: number
  faturamentoMensal: { mes: string; faturamento: number }[]
  vendasPorVendedor: { vendedor: string; vendas: number }[]
  topClientes: { cliente: string; valor: number }[]
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
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.totalVendas}</div>
            <p className="text-xs text-muted-foreground">+180.1% em relação ao mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propostas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.totalPropostas}</div>
            <p className="text-xs text-muted-foreground">+19% em relação ao mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.taxaConversao.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">+2% em relação ao mês passado</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <FaturamentoChart data={data.faturamentoMensal} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Vendas por Vendedor</CardTitle>
            <CardDescription>Ranking de vendas no período.</CardDescription>
          </CardHeader>
          <CardContent>
            <VendasVendedorChart data={data.vendasPorVendedor} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top Clientes</CardTitle>
          <CardDescription>Clientes com maior faturamento no período.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Faturamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topClientes.map((cliente) => (
                <TableRow key={cliente.cliente}>
                  <TableCell>
                    <div className="font-medium">{cliente.cliente}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {cliente.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
