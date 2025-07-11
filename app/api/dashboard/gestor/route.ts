import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extrair parâmetros de filtro
    const periodParam = searchParams.get("period") || "12months"
    const supervisorParam = searchParams.get("supervisor") || "all"
    const vendedorParam = searchParams.get("vendedor") || "all"
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Calcular período baseado nos parâmetros
    let startDate: string
    let endDate: string

    if (startDateParam && endDateParam) {
      startDate = startDateParam
      endDate = endDateParam
    } else {
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

    // Construir filtros baseados na hierarquia
    let vendedorFilter = ""
    let vendedorIds: string[] = []

    if (supervisorParam !== "all") {
      // Buscar os supervisionados do supervisor selecionado
      const supervisorResult = await pool.query(`SELECT children FROM clone_users_apprudnik WHERE id = $1`, [
        supervisorParam,
      ])

      if (supervisorResult.rows.length > 0 && supervisorResult.rows[0].children) {
        try {
          const children = JSON.parse(supervisorResult.rows[0].children)
          if (Array.isArray(children)) {
            vendedorIds = children.map((id) => id.toString())

            if (vendedorParam !== "all") {
              // Filtrar por vendedor específico
              vendedorIds = vendedorIds.filter((id) => id === vendedorParam)
            }
          }
        } catch (error) {
          console.error("Erro ao parsear children JSON:", error)
        }
      }

      if (vendedorIds.length > 0) {
        vendedorFilter = `AND p.seller = ANY($3)`
      } else {
        // Se não há supervisionados, retornar dados vazios
        vendedorIds = ["-1"] // ID inexistente para não retornar dados
        vendedorFilter = `AND p.seller = ANY($3)`
      }
    }

    const queryParams = [startDate, endDate]
    if (vendedorIds.length > 0) {
      queryParams.push(vendedorIds)
    }

    // 1. Faturamento Total
    const faturamentoResult = await pool.query(
      `SELECT COALESCE(SUM(CAST(total_price AS DECIMAL)), 0) as total
       FROM clone_propostas_apprudnik p
       WHERE p.has_generated_sale = true 
       AND p.created_at >= $1 
       AND p.created_at <= $2
       ${vendedorFilter}`,
      queryParams,
    )
    const totalFaturamento = Number(faturamentoResult.rows[0]?.total) || 0

    // 2. Total de Propostas
    const propostasResult = await pool.query(
      `SELECT COUNT(*) as total
       FROM clone_propostas_apprudnik p
       WHERE p.created_at >= $1 
       AND p.created_at <= $2
       ${vendedorFilter}`,
      queryParams,
    )
    const totalPropostas = Number(propostasResult.rows[0]?.total) || 0

    // 3. Total de Vendas
    const vendasResult = await pool.query(
      `SELECT COUNT(*) as total
       FROM clone_vendas_apprudnik v
       WHERE v.created_at >= $1 
       AND v.created_at <= $2
       ${vendedorFilter.replace("p.seller", "v.seller")}`,
      queryParams,
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
       WHERE p.has_generated_sale = true 
       AND p.created_at >= $1 
       AND p.created_at <= $2
       AND p.total_price IS NOT NULL
       ${vendedorFilter}
       GROUP BY 1
       ORDER BY 1`,
      queryParams,
    )

    const faturamentoMensal = faturamentoMensalResult.rows.map((row) => {
      const monthDate = new Date(row.month + "-01")
      return {
        mes: monthDate.toLocaleString("pt-BR", { month: "long", year: "numeric" }),
        faturamento: Number(row.faturamento) || 0,
      }
    })

    // 6. Performance por Supervisionado (se supervisor selecionado)
    let performanceSupervisionados: any[] = []

    if (supervisorParam !== "all" && vendedorIds.length > 0) {
      const performanceResult = await pool.query(
        `SELECT 
          u.id,
          u.name as vendedor,
          COUNT(DISTINCT p.id) as total_propostas,
          COUNT(DISTINCT CASE WHEN p.has_generated_sale = true THEN p.id END) as propostas_convertidas,
          COUNT(DISTINCT v.id) as total_vendas,
          COALESCE(SUM(CASE WHEN p.has_generated_sale = true THEN CAST(p.total_price AS DECIMAL) END), 0) as faturamento,
          CASE 
            WHEN COUNT(DISTINCT p.id) > 0 
            THEN ROUND((COUNT(DISTINCT v.id)::decimal / COUNT(DISTINCT p.id)) * 100, 2)
            ELSE 0 
          END as taxa_conversao
         FROM clone_users_apprudnik u
         LEFT JOIN clone_propostas_apprudnik p ON u.id = p.seller 
           AND p.created_at >= $1 AND p.created_at <= $2
         LEFT JOIN clone_vendas_apprudnik v ON u.id = v.seller 
           AND v.created_at >= $1 AND v.created_at <= $2
         WHERE u.id = ANY($3)
         GROUP BY u.id, u.name
         ORDER BY total_propostas DESC`,
        [startDate, endDate, vendedorIds],
      )

      performanceSupervisionados = performanceResult.rows.map((row) => ({
        id: row.id,
        vendedor: row.vendedor,
        totalPropostas: Number(row.total_propostas) || 0,
        propostasConvertidas: Number(row.propostas_convertidas) || 0,
        totalVendas: Number(row.total_vendas) || 0,
        faturamento: Number(row.faturamento) || 0,
        taxaConversao: Number(row.taxa_conversao) || 0,
      }))
    }

    // 7. Top Vendedores (geral ou filtrado)
    const topVendedoresResult = await pool.query(
      `SELECT 
        u.name as vendedor,
        COUNT(DISTINCT v.id) as vendas,
        COALESCE(SUM(CASE WHEN p.has_generated_sale = true THEN CAST(p.total_price AS DECIMAL) END), 0) as faturamento
       FROM clone_users_apprudnik u
       LEFT JOIN clone_vendas_apprudnik v ON u.id = v.seller 
         AND v.created_at >= $1 AND v.created_at <= $2
       LEFT JOIN clone_propostas_apprudnik p ON u.id = p.seller 
         AND p.created_at >= $1 AND p.created_at <= $2
       WHERE u.is_active = true
       ${vendedorIds.length > 0 ? "AND u.id = ANY($3)" : ""}
       GROUP BY u.name
       HAVING COUNT(DISTINCT v.id) > 0
       ORDER BY vendas DESC
       LIMIT 10`,
      vendedorIds.length > 0 ? queryParams : [startDate, endDate],
    )

    const vendasPorVendedor = topVendedoresResult.rows.map((row) => ({
      vendedor: String(row.vendedor),
      vendas: Number(row.vendas) || 0,
      faturamento: Number(row.faturamento) || 0,
    }))

    // 8. Vendas com Fatura Emitida
    const vendasFaturadas = await pool.query(
      `SELECT COUNT(*) as total
       FROM clone_vendas_apprudnik v
       WHERE v.is_invoice_issued = true 
       AND v.created_at >= $1 
       AND v.created_at <= $2
       ${vendedorFilter.replace("p.seller", "v.seller")}`,
      queryParams,
    )
    const totalVendasFaturadas = Number(vendasFaturadas.rows[0]?.total) || 0

    // Buscar nome do supervisor para exibição
    let supervisorNome = "Todos os supervisores"
    if (supervisorParam !== "all") {
      const supervisorNomeResult = await pool.query(`SELECT name FROM clone_users_apprudnik WHERE id = $1`, [
        supervisorParam,
      ])
      if (supervisorNomeResult.rows.length > 0) {
        supervisorNome = supervisorNomeResult.rows[0].name
      }
    }

    const data = {
      totalFaturamento,
      totalPropostas,
      totalVendas,
      totalVendasFaturadas,
      taxaConversao: Number(taxaConversao.toFixed(2)),
      faturamentoMensal,
      vendasPorVendedor,
      performanceSupervisionados,
      filtros: {
        periodo: `${startDate} a ${endDate}`,
        supervisor: supervisorNome,
        totalSupervisionados: vendedorIds.length,
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
