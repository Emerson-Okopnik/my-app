import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    // Exemplo de período fixo (últimos 12 meses). Idealmente, viria da query string.
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    const period = twelveMonthsAgo.toISOString().split("T")[0]

    // 1. Faturamento Total (usando total_price que deve ser numérico)
    const faturamentoResult = await pool.query(
      `SELECT COALESCE(SUM(CAST(total_price AS DECIMAL)), 0) as total
       FROM clone_propostas_apprudnik
       WHERE has_generated_sale = true AND created_at >= '2023-01-01 00:00:00'`,
      [period],
    )
    const totalFaturamento = Number(faturamentoResult.rows[0]?.total) || 0

    // 2. Total de Propostas
    const propostasResult = await pool.query(
      `SELECT COUNT(*) as total
       FROM clone_propostas_apprudnik
       WHERE created_at >= '2023-01-01 00:00:00'`,
      [period],
    )
    const totalPropostas = Number(propostasResult.rows[0]?.total) || 0

    // 3. Total de Vendas
    const vendasResult = await pool.query(
      `SELECT COUNT(*) as total
       FROM clone_vendas_apprudnik
       WHERE created_at >= '2023-01-01 00:00:00'`,
      [period],
    )
    const totalVendas = Number(vendasResult.rows[0]?.total) || 0

    // 4. Taxa de Conversão (Propostas -> Vendas)
    const taxaConversao = totalPropostas > 0 ? (totalVendas / totalPropostas) * 100 : 0

    // 5. Faturamento Mensal (últimos 12 meses)
    const faturamentoMensalResult = await pool.query(
      `SELECT 
        to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
        COALESCE(SUM(CAST(total_price AS DECIMAL)), 0) as faturamento
       FROM clone_propostas_apprudnik
       WHERE has_generated_sale = true 
       AND created_at >= '2023-01-01 00:00:00'
       AND total_price IS NOT NULL
       GROUP BY 1
       ORDER BY 1`,
      [period],
    )

    const faturamentoMensal = faturamentoMensalResult.rows.map((row) => {
      const monthDate = new Date(row.month + "-01")
      return {
        mes: monthDate.toLocaleString("pt-BR", { month: "long" }),
        faturamento: Number(row.faturamento) || 0,
      }
    })

    // 6. Vendas por Vendedor
    const vendasPorVendedorResult = await pool.query(
      `SELECT 
        COALESCE(u.name, 'Vendedor não identificado') as vendedor, 
        COUNT(v.id) as vendas
       FROM clone_vendas_apprudnik v
       LEFT JOIN clone_users_apprudnik u ON v.seller = u.id
       WHERE v.created_at >= '2023-01-01 00:00:00'
       GROUP BY u.name
       ORDER BY vendas DESC
       LIMIT 10`,
      [period],
    )

    const vendasPorVendedor = vendasPorVendedorResult.rows.map((row) => ({
      vendedor: String(row.vendedor),
      vendas: Number(row.vendas) || 0,
    }))

    // 7. Vendas com Fatura Emitida (usando is_invoice_issued)
    const vendasFaturadas = await pool.query(
      `SELECT COUNT(*) as total
       FROM clone_vendas_apprudnik
       WHERE is_invoice_issued = true AND created_at >= '2023-01-01 00:00:00'`,
      [period],
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
