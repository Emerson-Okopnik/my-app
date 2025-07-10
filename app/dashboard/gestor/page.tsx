"use client"

import { useEffect, useState } from "react"
import GestorDashboard from "@/components/gestor-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function GestorPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard/gestor")
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

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-80 w-full lg:col-span-2" />
        <Skeleton className="h-80 w-full lg:col-span-2" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Erro: {error}</div>
  }

  return <GestorDashboard data={data} />
}
