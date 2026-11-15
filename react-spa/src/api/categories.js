import { API_URL } from './index.js'

export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`)
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function createCategory(name) {
  const res = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category_name: name }),
  })
  if (!res.ok) throw new Error('Failed to create category')
  return res.json()
}

export async function deleteCategory(id) {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete category')
  return res.json()
}
