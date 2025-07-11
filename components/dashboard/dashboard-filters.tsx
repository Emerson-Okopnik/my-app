"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Filter, Users } from "lucide-react"

type FilterProps = {
  onFilterChange: (filters: {
    period: string
    supervisor: string
    vendedor: string
    startDate: string
    endDate: string
  }) => void
  loading?: boolean
}

type Vendedor = {
  id: string
  name: string
  role: string
  children?: string[]
}

export default function DashboardFilters({ onFilterChange, loading = false }: FilterProps) {
  const [period, setPeriod] = useState("12months")
  const [supervisor, setSupervisor] = useState("all")
  const [vendedor, setVendedor] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [supervisores, setSupervisores] = useState<Vendedor[]>([])
  const [supervisionados, setSupervisionados] = useState<Vendedor[]>([])

  // Carregar lista de vendedores e supervisores
  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const response = await fetch("/api/vendedores")
        if (response.ok) {
          const data = await response.json()
          setVendedores(data.vendedores)
          setSupervisores(data.supervisores)
        }
      } catch (error) {
        console.error("Erro ao carregar vendedores:", error)
      }
    }

    fetchVendedores()
  }, [])

  // Atualizar supervisionados quando supervisor muda
  useEffect(() => {
    if (supervisor !== "all") {
      const supervisorData = supervisores.find((s) => s.id === supervisor)
      if (supervisorData && supervisorData.children) {
        const supervisionadosData = vendedores.filter((v) => supervisorData.children?.includes(v.id))
        setSupervisionados(supervisionadosData)
      } else {
        setSupervisionados([])
      }
      setVendedor("all") // Reset vendedor quando supervisor muda
    } else {
      setSupervisionados([])
    }
  }, [supervisor, supervisores, vendedores])

  const handleApplyFilters = () => {
    onFilterChange({
      period,
      supervisor,
      vendedor,
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 items-end">
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
            <Label htmlFor="supervisor">Supervisor</Label>
            <Select value={supervisor} onValueChange={setSupervisor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o supervisor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os supervisores</SelectItem>
                {supervisores.map((sup) => (
                  <SelectItem key={sup.id} value={sup.id}>
                    {sup.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendedor">Supervisionado</Label>
            <Select value={vendedor} onValueChange={setVendedor} disabled={supervisor === "all"}>
              <SelectTrigger>
                <SelectValue
                  placeholder={supervisor === "all" ? "Selecione um supervisor primeiro" : "Todos os supervisionados"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os supervisionados</SelectItem>
                {supervisionados.map((vend) => (
                  <SelectItem key={vend.id} value={vend.id}>
                    {vend.name}
                  </SelectItem>
                ))}
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

        {supervisor !== "all" && supervisionados.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Users className="h-4 w-4" />
              <span className="font-medium">
                Supervisionados de {supervisores.find((s) => s.id === supervisor)?.name}:
              </span>
              <span>{supervisionados.map((s) => s.name).join(", ")}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
