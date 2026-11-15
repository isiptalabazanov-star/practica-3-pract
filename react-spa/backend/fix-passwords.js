import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'bdpractikatim',
  port: parseInt(process.env.PG_PORT || '5432'),
})

const adminHash = '$2a$10$E5gRGtJaUqgg5QDiVXVmL.PE5zpTSosIlOfzuyRT5r/Bh4vAVmjDm'
const clientHash = '$2a$10$yeAC9vFf3DecRSfxNlywVu1kbsPpKSv8D2zi2Tk856Qx9HjujR55e'

async function updatePasswords() {
  await pool.query(
    `UPDATE users SET password_hash = $1 WHERE email = 'admin@mail.ru'`,
    [adminHash]
  )
  await pool.query(
    `UPDATE users SET password_hash = $1 WHERE email = 'client@mail.ru'`,
    [clientHash]
  )
  console.log('✅ Пароли обновлены!')

  const result = await pool.query(`SELECT email, full_name, role_id FROM users`)
  console.log('\nТекущие пользователи:')
  result.rows.forEach(u => console.log(`  ${u.email} | ${u.full_name} | role: ${u.role_id}`))
}

updatePasswords().finally(() => pool.end())
