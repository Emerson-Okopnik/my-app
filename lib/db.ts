import { neon } from "@neondatabase/serverless"

// Verificar se todas as variáveis de ambiente necessárias estão definidas
const requiredEnvVars = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
}

// Verificar se alguma variável está faltando
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key, _]) => key)

if (missingVars.length > 0) {
  throw new Error(`As seguintes variáveis de ambiente não estão definidas: ${missingVars.join(", ")}`)
}

// Construir a URL de conexão a partir das variáveis separadas
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?pgbouncer=true&connection_limit=1`

const sql = neon(connectionString)

export default sql
