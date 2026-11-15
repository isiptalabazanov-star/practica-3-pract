import { API_URL } from './index.js'

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`)
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function assignCouponToUser(userId, couponId) {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coupon_id: couponId }),
  })
  if (!res.ok) throw new Error('Failed to assign coupon')
  return res.json()
}
