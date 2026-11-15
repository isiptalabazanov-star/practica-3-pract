import { API_URL } from './index.js'

export async function getDiscountCoupons() {
  const res = await fetch(`${API_URL}/discount-coupons`)
  if (!res.ok) throw new Error('Failed to fetch coupons')
  return res.json()
}

export async function createCoupon(data) {
  const res = await fetch(`${API_URL}/discount-coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create coupon')
  return res.json()
}

export async function deleteCoupon(id) {
  const res = await fetch(`${API_URL}/discount-coupons/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete coupon')
  return res.json()
}
