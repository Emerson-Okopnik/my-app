// test-db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "",
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Conexão com o banco estabelecida:', result.rows[0].current_time);
    
    // Testar se as tabelas existem
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'clone_%'
    `);
    
    console.log('📋 Tabelas encontradas:', tablesResult.rows.map(row => row.table_name));
    
    client.release();
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  } finally {
    await pool.end();
  }
}

testConnection();