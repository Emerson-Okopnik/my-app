"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

type FilterProps = {
  onFilterChange: (filters: {
    period: string
    team: string
    startDate: string
    endDate: string
  }) => void
  loading?: boolean
}

export default function DashboardFilters({ onFilterChange, loading = false }: FilterProps) {
  const [period, setPeriod] = useState("12months")
  const [team, setTeam] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleApplyFilters = () => {
    onFilterChange({
      period,
      team,
      startDate,
      endDate,
    })
  }

  const handlePeriodChange = (value: string) => {
    setPeriod(value)

    // Auto-calcular datas baseado no período selecionado
    const now = new Date()
    let start = new Date()

    switch (value) {
      case "1month":
        start.setMonth(now.getMonth() - 1)
        break
      case "3months":
        start.setMonth(now.getMonth() - 3)
        break
      case "6months":
        start.setMonth(now.getMonth() - 6)
        break
      case "12months":
        start.setMonth(now.getMonth() - 12)
        break
      case "ytd":
        start = new Date(now.getFullYear(), 0, 1)
        break
      case "custom":
        return // Não auto-calcular para período customizado
    }

    setStartDate(start.toISOString().split("T")[0])
    setEndDate(now.toISOString().split("T")[0])
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
          <div className="space-y-2">
            <Label htmlFor="period">Período</Label>
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Último mês</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="12months">Últimos 12 meses</SelectItem>
                <SelectItem value="ytd">Ano atual</SelectItem>
                <SelectItem value="custom">Período customizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Equipe/Vendedor</Label>
            <Select value={team} onValueChange={setTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a equipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as equipes</SelectItem>
                <SelectItem value="team1">Equipe 1</SelectItem>
                <SelectItem value="team2">Equipe 2</SelectItem>
                <SelectItem value="individual">Vendedor específico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {period === "custom" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="startDate">Data inicial</Label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data final</Label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </>
          )}

          <Button onClick={handleApplyFilters} disabled={loading} className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            {loading ? "Aplicando..." : "Aplicar Filtros"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
