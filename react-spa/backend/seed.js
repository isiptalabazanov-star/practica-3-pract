import 'dotenv/config'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'bdpractikatim',
  port: parseInt(process.env.PG_PORT || '5432'),
})

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, '..', '..', 'database.sql'), 'utf8')

async function seed() {
  await pool.query(sql)
  console.log('✅ database.sql применён')

  const services = await pool.query('SELECT COUNT(*) AS cnt FROM services')
  const categories = await pool.query('SELECT COUNT(*) AS cnt FROM categories')
  const users = await pool.query('SELECT COUNT(*) AS cnt FROM users')
  console.log(`Услуги: ${services.rows[0].cnt}, Категории: ${categories.rows[0].cnt}, Пользователи: ${users.rows[0].cnt}`)
}

seed()
  .catch((err) => console.error('❌ Ошибка:', err.message))
  .finally(() => pool.end())
