"use client"

import { useEffect, useState } from "react"
import GestorDashboard from "@/components/dashboard/gestor-dashboard"
import DashboardFilters from "@/components/dashboard/dashboard-filters"
import { Skeleton } from "@/components/ui/skeleton"

type FilterState = {
  period: string
  supervisor: string
  vendedor: string
  startDate: string
  endDate: string
}

export default function GestorPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    period: "12months",
    supervisor: "all",
    vendedor: "all",
    startDate: "",
    endDate: "",
  })

  const fetchData = async (currentFilters: FilterState) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      if (currentFilters.period) params.append("period", currentFilters.period)
      if (currentFilters.supervisor && currentFilters.supervisor !== "all") {
        params.append("supervisor", currentFilters.supervisor)
      }
      if (currentFilters.vendedor && currentFilters.vendedor !== "all") {
        params.append("vendedor", currentFilters.vendedor)
      }
      if (currentFilters.startDate) params.append("startDate", currentFilters.startDate)
      if (currentFilters.endDate) params.append("endDate", currentFilters.endDate)

      const response = await fetch(`/api/dashboard/gestor?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Falha ao buscar dados da API")
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ocorreu um erro desconhecido")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Carregar dados iniciais
    fetchData(filters)
  }, [])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    fetchData(newFilters)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Erro ao carregar dados</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard do Gestor</h1>
          <p className="text-muted-foreground">Visão geral das vendas e performance da equipe</p>
        </div>
      </div>

      <DashboardFilters onFilterChange={handleFilterChange} loading={loading} />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-80 w-full lg:col-span-2" />
          <Skeleton className="h-80 w-full lg:col-span-2" />
        </div>
      ) : (
        <GestorDashboard data={data} />
      )}
    </div>
  )
}
