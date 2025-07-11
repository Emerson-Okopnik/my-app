import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extrair parâmetros de filtro
    const periodParam = searchParams.get("period") || "12months"
    const teamParam = searchParams.get("team") || "all"
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Calcular período baseado nos parâmetros
    let startDate: string
    let endDate: string

    if (startDateParam && endDateParam) {
      // Período customizado
      startDate = startDateParam
      endDate = endDateParam
    } else {
      // Período pré-definido
      const now = new Date()
      const start = new Date()

      switch (periodParam) {
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
          start.setFullYear(now.getFullYear(), 0, 1)
          break
        default:
          start.setMonth(now.getMonth() - 12)
      }

      startDate = start.toISOString().split("T")[0]
      endDate = now.toISOString().split("T")[0]
    }

    // Construir filtro de equipe
    let teamFilter = ""
    const teamParams: any[] = [startDate, endDate]

    if (teamParam && teamParam !== "all") {
      // Aqui você pode implementar a lógica específica para filtrar por equipe
      // Por exemplo, se você tiver um campo 'team' ou 'supervisor' nas tabelas
      teamFilter = " AND u.supervisor = $3"
      teamParams.push(teamParam)
    }

    // 1. Faturamento Total
    const faturamentoResult = await pool.query(
      `SELECT COALESCE(SUM(CAST(total_price AS DECIMAL)), 0) as total
       FROM clone_propostas_apprudnik p
       ${teamParam !== "all" ? "LEFT JOIN clone_users_apprudnik u ON p.seller = u.id" : ""}
       WHERE p.has_generated_sale = true 
       AND p.created_at >= $1 
       AND p.created_at <= $2
       ${teamParam !== "all" ? teamFilter : ""}`,
      teamParams,
    )
    const totalFaturamento = Number(faturamentoResult.rows[0]?.total) || 0

    // 2. Total de Propostas
    const propostasResult = await pool.query(
      `SELECT COUNT(*) as total
       FROM clone_propostas_apprudnik p
       ${teamParam !== "all" ? "LEFT JOIN clone_users_apprudnik u ON p.seller = u.id" : ""}
       WHERE p.created_at >= $1 
       AND p.created_at <= $2
       ${teamParam !== "all" ? teamFilter : ""}`,
      teamParams,
    )
    const totalPropostas = Number(propostasResult.rows[0]?.total) || 0

    // 3. Total de Vendas
    const vendasResult = await pool.query(
      `SELECT COUNT(*) as total
       FROM clone_vendas_apprudnik v
       ${teamParam !== "all" ? "LEFT JOIN clone_users_apprudnik u ON v.seller = u.id" : ""}
       WHERE v.created_at >= $1 
       AND v.created_at <= $2
       ${teamParam !== "all" ? teamFilter : ""}`,
      teamParams,
    )
    const totalVendas = Number(vendasResult.rows[0]?.total) || 0

    // 4. Taxa de Conversão
    const taxaConversao = totalPropostas > 0 ? (totalVendas / totalPropostas) * 100 : 0

    // 5. Faturamento Mensal
    const faturamentoMensalResult = await pool.query(
      `SELECT 
        to_char(date_trunc('month', p.created_at), 'YYYY-MM') as month,
        COALESCE(SUM(CAST(p.total_price AS DECIMAL)), 0) as faturamento
       FROM clone_propostas_apprudnik p
       ${teamParam !== "all" ? "LEFT JOIN clone_users_apprudnik u ON p.seller = u.id" : ""}
       WHERE p.has_generated_sale = true 
       AND p.created_at >= $1 
       AND p.created_at <= $2
       AND p.total_price IS NOT NULL
       ${teamParam !== "all" ? teamFilter : ""}
       GROUP BY 1
       ORDER BY 1`,
      teamParams,
    )

    const faturamentoMensal = faturamentoMensalResult.rows.map((row) => {
      const monthDate = new Date(row.month + "-01")
      return {
        mes: monthDate.toLocaleString("pt-BR", { month: "long", year: "numeric" }),
        faturamento: Number(row.faturamento) || 0,
      }
    })

    // 6. Vendas por Vendedor
    const vendasPorVendedorResult = await pool.query(
      `SELECT 
        COALESCE(u.name, 'Vendedor não identificado') as vendedor, 
        COUNT(v.id) as vendas,
        COALESCE(SUM(CAST(p.total_price AS DECIMAL)), 0) as faturamento
       FROM clone_vendas_apprudnik v
       LEFT JOIN clone_users_apprudnik u ON v.seller = u.id
       LEFT JOIN clone_propostas_apprudnik p ON p.seller = v.seller AND p.has_generated_sale = true
       WHERE v.created_at >= $1 
       AND v.created_at <= $2
       ${teamParam !== "all" ? teamFilter : ""}
       GROUP BY u.name
       ORDER BY vendas DESC
       LIMIT 10`,
      teamParams,
    )

    const vendasPorVendedor = vendasPorVendedorResult.rows.map((row) => ({
      vendedor: String(row.vendedor),
      vendas: Number(row.vendas) || 0,
      faturamento: Number(row.faturamento) || 0,
    }))

    // 7. Vendas com Fatura Emitida
    const vendasFaturadas = await pool.query(
      `SELECT COUNT(*) as total
       FROM clone_vendas_apprudnik v
       ${teamParam !== "all" ? "LEFT JOIN clone_users_apprudnik u ON v.seller = u.id" : ""}
       WHERE v.is_invoice_issued = true 
       AND v.created_at >= $1 
       AND v.created_at <= $2
       ${teamParam !== "all" ? teamFilter : ""}`,
      teamParams,
    )
    const totalVendasFaturadas = Number(vendasFaturadas.rows[0]?.total) || 0

    const data = {
      totalFaturamento,
      totalPropostas,
      totalVendas,
      totalVendasFaturadas,
      taxaConversao: Number(taxaConversao.toFixed(2)),
      faturamentoMensal,
      vendasPorVendedor,
      filtros: {
        periodo: `${startDate} a ${endDate}`,
        equipe: teamParam === "all" ? "Todas as equipes" : `Equipe: ${teamParam}`,
      },
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro na API:", error)
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
