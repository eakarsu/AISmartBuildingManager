import bcrypt from 'bcryptjs';
import pool from '../db.js';

async function main() {
  if (process.env.ALLOW_SCHEMA_MIGRATION !== 'true') throw new Error('ALLOW_SCHEMA_MIGRATION=true is required');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,email VARCHAR(255) UNIQUE NOT NULL,password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,role VARCHAR(50) NOT NULL,created_at TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS ai_results(
      id SERIAL PRIMARY KEY,user_id INTEGER REFERENCES users(id),endpoint VARCHAR(100),
      input_data JSONB,result JSONB,created_at TIMESTAMP DEFAULT NOW());
  `);
  const email = process.env.PROVISION_ADMIN_EMAIL;
  const password = process.env.PROVISION_ADMIN_PASSWORD;
  const name = process.env.PROVISION_ADMIN_NAME || 'Runtime Administrator';
  if (!email || !password) throw new Error('Provisioned administrator credentials are required');
  await pool.query(
    `INSERT INTO users(email,password,name,role) VALUES($1,$2,$3,'admin')
     ON CONFLICT(email) DO UPDATE SET password=EXCLUDED.password,name=EXCLUDED.name,role='admin'`,
    [email, await bcrypt.hash(password, 12), name]
  );
}

main().then(() => pool.end()).catch(async (error) => {
  console.error(error.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
