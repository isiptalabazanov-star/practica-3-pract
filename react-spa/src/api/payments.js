import { API_URL } from './index.js'

export async function getPayments() {
  const res = await fetch(`${API_URL}/payments`)
  if (!res.ok) throw new Error('Failed to fetch payments')
  return res.json()
}

export async function createPayment(data) {
  const res = await fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create payment')
  return res.json()
}
