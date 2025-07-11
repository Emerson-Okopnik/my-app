import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type PerformanceData = {
  id: string
  vendedor: string
  totalPropostas: number
  propostasConvertidas: number
  totalVendas: number
  faturamento: number
  taxaConversao: number
}

type PerformanceSupervisionadosProps = {
  data: PerformanceData[]
  supervisorNome: string
}

export default function PerformanceSupervisionados({ data, supervisorNome }: PerformanceSupervisionadosProps) {
  if (!data || data.length === 0) {
    return null
  }

  const getTaxaConversaoColor = (taxa: number) => {
    if (taxa >= 70) return "text-green-600"
    if (taxa >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getTaxaConversaoIcon = (taxa: number) => {
    if (taxa >= 70) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (taxa >= 50) return <Minus className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Performance dos Supervisionados</CardTitle>
        <CardDescription>Detalhamento da performance da equipe de {supervisorNome}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-center">Propostas</TableHead>
                <TableHead className="text-center">Convertidas</TableHead>
                <TableHead className="text-center">Vendas</TableHead>
                <TableHead className="text-center">Taxa Conversão</TableHead>
                <TableHead className="text-right">Faturamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.vendedor}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono">
                      {item.totalPropostas}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-mono">
                      {item.propostasConvertidas}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default" className="font-mono">
                      {item.totalVendas}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getTaxaConversaoIcon(item.taxaConversao)}
                      <span className={`font-semibold ${getTaxaConversaoColor(item.taxaConversao)}`}>
                        {item.taxaConversao}%
                      </span>
                    </div>
                    <Progress value={item.taxaConversao} className="mt-2 h-2" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold">
                      R${" "}
                      {item.faturamento.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    {item.totalVendas > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Ticket: R${" "}
                        {(item.faturamento / item.totalVendas).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Resumo da equipe */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{data.reduce((sum, item) => sum + item.totalPropostas, 0)}</div>
              <p className="text-xs text-muted-foreground">Total de Propostas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{data.reduce((sum, item) => sum + item.totalVendas, 0)}</div>
              <p className="text-xs text-muted-foreground">Total de Vendas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {data.length > 0
                  ? (data.reduce((sum, item) => sum + item.taxaConversao, 0) / data.length).toFixed(1)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Taxa Média da Equipe</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                R${" "}
                {data
                  .reduce((sum, item) => sum + item.faturamento, 0)
                  .toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
              </div>
              <p className="text-xs text-muted-foreground">Faturamento Total</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
