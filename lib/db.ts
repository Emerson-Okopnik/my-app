import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("A variável de ambiente DATABASE_URL não está definida.")
}

// A URL de conexão deve ser armazenada em uma variável de ambiente
const sql = neon(process.env.DATABASE_URL)

export default sql
