// test-db.js
const { neon } = require('@neondatabase/serverless');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?pgbouncer=true&connection_limit=1`;

const sql = neon(connectionString);

async function testConnection() {
  try {
    console.log('🔗 Tentando conectar com:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      // Não mostrar a senha por segurança
    });
    
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Conexão com o banco estabelecida:', result[0].current_time);
    
    // Testar uma query nas suas tabelas
    const userCount = await sql`SELECT COUNT(*) as total FROM clone_users_apprudnik`;
    console.log('👥 Total de usuários na base:', userCount[0].total);
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testConnection();