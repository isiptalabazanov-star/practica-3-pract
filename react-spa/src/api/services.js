import { API_URL } from './index.js'

export async function getServices() {
  const res = await fetch(`${API_URL}/services`)
  if (!res.ok) throw new Error('Failed to fetch services')
  return res.json()
}

export async function getService(id) {
  const res = await fetch(`${API_URL}/services/${id}`)
  if (!res.ok) throw new Error('Service not found')
  return res.json()
}

export async function createService(data) {
  const res = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create service')
  return res.json()
}

export async function updateService(id, data) {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update service')
  return res.json()
}

export async function deleteService(id) {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete service')
  return res.json()
}
