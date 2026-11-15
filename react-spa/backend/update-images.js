import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'bdpractikatim',
  port: parseInt(process.env.PG_PORT || '5432'),
})

async function update() {
  await pool.query(`UPDATE services SET image_url='lyustra.webp' WHERE service_name='Люстра под ключ'`)
  await pool.query(`UPDATE services SET image_url='shkaf.jpg' WHERE service_name='Сборка шкафа-купе'`)
  console.log('✅ Изображения обновлены')
  const r = await pool.query(`SELECT service_name, image_url FROM services WHERE service_name IN ('Люстра под ключ', 'Сборка шкафа-купе')`)
  console.log(r.rows)
}

update().catch(e => console.error(e.message)).finally(() => pool.end())
