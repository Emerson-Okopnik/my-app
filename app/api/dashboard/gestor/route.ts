import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET() {
  try {
    // Exemplo de período fixo (últimos 12 meses). Idealmente, viria da query string.
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    const period = twelveMonthsAgo.toISOString().split("T")[0]

    // 1. Faturamento Total
    const faturamentoResult = await sql`
      SELECT SUM(total_price) as total
      FROM clone_propostas_apprudnik
      WHERE has_generated_sale = true AND created_at >= ${period};
    `
    const totalFaturamento = faturamentoResult[0]?.total || 0

    // 2. Total de Propostas
    const propostasResult = await sql`
      SELECT COUNT(*) as total
      FROM clone_propostas_apprudnik
      WHERE created_at >= ${period};
    `
    const totalPropostas = propostasResult[0]?.total || 0

    // 3. Total de Vendas
    const vendasResult = await sql`
      SELECT COUNT(*) as total
      FROM clone_vendas_apprudnik
      WHERE created_at >= ${period};
    `
    const totalVendas = vendasResult[0]?.total || 0

    // 4. Taxa de Conversão (Propostas -> Vendas)
    const taxaConversao = totalPropostas > 0 ? (totalVendas / totalPropostas) * 100 : 0

    // 5. Faturamento Mensal (últimos 12 meses)
    const faturamentoMensalResult = await sql`
      SELECT 
        to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
        SUM(total_price) as faturamento
      FROM clone_propostas_apprudnik
      WHERE has_generated_sale = true AND created_at >= ${period}
      GROUP BY 1
      ORDER BY 1;
    `
    const faturamentoMensal = faturamentoMensalResult.map((row) => ({
      mes: new Date(row.month + "-02").toLocaleString("default", { month: "long" }), // Gambiarra para pegar o nome do mês
      faturamento: Number(row.faturamento),
    }))

    // 6. Vendas por Vendedor
    const vendasPorVendedorResult = await sql`
      SELECT u.name as vendedor, COUNT(v.id) as vendas
      FROM clone_vendas_apprudnik v
      JOIN clone_users_apprudnik u ON v.seller = u.id
      WHERE v.created_at >= ${period}
      GROUP BY u.name
      ORDER BY vendas DESC
      LIMIT 10;
    `
    const vendasPorVendedor = vendasPorVendedorResult.map((row) => ({
      vendedor: row.vendedor,
      vendas: Number(row.vendas),
    }))

    // 7. Top Clientes
    const topClientesResult = await sql`
        SELECT customer, SUM(total_price) as valor
        FROM clone_propostas_apprudnik
        WHERE has_generated_sale = true AND created_at >= ${period}
        GROUP BY customer
        ORDER BY valor DESC
        LIMIT 5;
    `
    const topClientes = topClientesResult.map((row) => ({
      cliente: row.customer,
      valor: Number(row.valor),
    }))

    const data = {
      totalFaturamento,
      totalPropostas,
      totalVendas,
      taxaConversao,
      faturamentoMensal,
      vendasPorVendedor,
      topClientes,
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro na API:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
