import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    // Buscar todos os usuários ativos
    const result = await pool.query(
      `SELECT id, name, email, role, supervisors, children
       FROM clone_users_apprudnik
       WHERE is_active = true
       ORDER BY name`,
    )

    const usuarios = result.rows

    // Separar supervisores (quem tem supervisionados)
    const supervisores = usuarios
      .filter((user) => {
        try {
          const children = user.children ? JSON.parse(user.children) : []
          return Array.isArray(children) && children.length > 0
        } catch {
          return false
        }
      })
      .map((user) => ({
        id: user.id.toString(),
        name: user.name,
        role: user.role,
        children: user.children ? JSON.parse(user.children) : [],
      }))

    // Todos os vendedores
    const vendedores = usuarios.map((user) => ({
      id: user.id.toString(),
      name: user.name,
      role: user.role,
      supervisors: user.supervisors ? JSON.parse(user.supervisors) : [],
      children: user.children ? JSON.parse(user.children) : [],
    }))

    return NextResponse.json({
      vendedores,
      supervisores,
    })
  } catch (error) {
    console.error("Erro ao buscar vendedores:", error)
    return NextResponse.json({ message: "Erro interno do servidor", error: error.message }, { status: 500 })
  }
}
