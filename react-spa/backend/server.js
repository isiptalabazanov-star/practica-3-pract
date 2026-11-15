import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'bdpractikatim',
  port: parseInt(process.env.PG_PORT || '5432'),
})

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY category_name')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/categories', async (req, res) => {
  try {
    const { category_name } = req.body
    const result = await pool.query(
      'INSERT INTO categories (category_name) VALUES ($1) RETURNING *',
      [category_name]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE category_id = $1', [req.params.id])
    res.json({ message: 'Category deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/services', async (req, res) => {
  try {
    const { category_id, min_price, max_price } = req.query
    let query = `
      SELECT s.*, c.category_name
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.category_id
      WHERE s.is_active = TRUE
    `
    const params = []
    let paramIndex = 1
    if (category_id) {
      query += ` AND s.category_id = $${paramIndex}`
      params.push(category_id)
      paramIndex++
    }
    if (min_price) {
      query += ` AND s.price >= $${paramIndex}`
      params.push(min_price)
      paramIndex++
    }
    if (max_price) {
      query += ` AND s.price <= $${paramIndex}`
      params.push(max_price)
      paramIndex++
    }
    query += ' ORDER BY s.service_name'
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/services/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, c.category_name
       FROM services s
       LEFT JOIN categories c ON s.category_id = c.category_id
       WHERE s.service_id = $1`,
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/appointments', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.email as user_email, s.service_name
       FROM appointments a
       JOIN users u ON a.user_id = u.user_id
       JOIN services s ON a.service_id = s.service_id
       ORDER BY a.appointment_time DESC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/appointments', async (req, res) => {
  try {
    const { user_id, service_id, appointment_time } = req.body
    const result = await pool.query(
      'INSERT INTO appointments (user_id, service_id, appointment_time) VALUES ($1, $2, $3) RETURNING *',
      [user_id, service_id, appointment_time]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { appointment_time, status } = req.body
    const result = await pool.query(
      'UPDATE appointments SET appointment_time = COALESCE($1, appointment_time), status = COALESCE($2, status) WHERE appointment_id = $3 RETURNING *',
      [appointment_time, status, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE appointment_id = $1', [req.params.id])
    res.json({ message: 'Appointment deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/payments', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.email as user_email, a.appointment_time
       FROM payments p
       JOIN users u ON p.user_id = u.user_id
       JOIN appointments a ON p.appointment_id = a.appointment_id
       ORDER BY p.paid_at DESC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/payments', async (req, res) => {
  try {
    const { appointment_id, user_id, amount, payment_method } = req.body
    const result = await pool.query(
      'INSERT INTO payments (appointment_id, user_id, amount, payment_method, payment_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [appointment_id, user_id, amount, payment_method, 'completed']
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body
    const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' })
    }
    const password_hash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, role_id) VALUES ($1, $2, $3, 2) RETURNING user_id, email, full_name, role_id',
      [email, password_hash, full_name]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const coupon = user.coupon_id
      ? await pool.query('SELECT * FROM discount_coupons WHERE coupon_id = $1', [user.coupon_id])
      : { rows: [] }
    res.json({
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role_id: user.role_id,
      coupon: coupon.rows[0] || null,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.email, u.full_name, u.role_id, u.coupon_id, u.created_at,
              r.role_name,
              dc.coupon_code, dc.discount_percent
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN discount_coupons dc ON u.coupon_id = dc.coupon_id
       ORDER BY u.user_id`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/users/:id', async (req, res) => {
  try {
    const { coupon_id } = req.body
    await pool.query('UPDATE users SET coupon_id = $1 WHERE user_id = $2', [coupon_id, req.params.id])
    res.json({ message: 'User updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/discount-coupons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM discount_coupons ORDER BY discount_percent DESC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/discount-coupons', async (req, res) => {
  try {
    const { coupon_code, discount_percent, description } = req.body
    const result = await pool.query(
      'INSERT INTO discount_coupons (coupon_code, discount_percent, description) VALUES ($1, $2, $3) RETURNING *',
      [coupon_code, discount_percent, description]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/discount-coupons/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM discount_coupons WHERE coupon_id = $1', [req.params.id])
    res.json({ message: 'Coupon deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/services/:id', async (req, res) => {
  try {
    const { service_name, description, duration_min, price, discount_percent, category_id, is_active } = req.body
    await pool.query(
      `UPDATE services SET
        service_name = COALESCE($1, service_name),
        description = COALESCE($2, description),
        duration_min = COALESCE($3, duration_min),
        price = COALESCE($4, price),
        discount_percent = COALESCE($5, discount_percent),
        category_id = COALESCE($6, category_id),
        is_active = COALESCE($7, is_active)
      WHERE service_id = $8`,
      [service_name, description, duration_min, price, discount_percent, category_id, is_active, req.params.id]
    )
    res.json({ message: 'Service updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/services', async (req, res) => {
  try {
    const { service_name, description, duration_min, price, discount_percent, category_id, image_url } = req.body
    const result = await pool.query(
      `INSERT INTO services (service_name, description, duration_min, price, discount_percent, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [service_name, description, duration_min, price, discount_percent || 0, category_id, image_url || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/services/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE service_id = $1', [req.params.id])
    res.json({ message: 'Service deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
