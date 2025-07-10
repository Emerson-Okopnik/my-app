// test-db.js
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Conexão com o banco estabelecida:', result[0].current_time);
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  }
}

testConnection();