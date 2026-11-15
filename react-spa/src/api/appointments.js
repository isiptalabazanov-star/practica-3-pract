import { API_URL } from './index.js'

export async function getAppointments() {
  const res = await fetch(`${API_URL}/appointments`)
  if (!res.ok) throw new Error('Failed to fetch appointments')
  return res.json()
}

export async function createAppointment(data) {
  const res = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create appointment')
  return res.json()
}

export async function updateAppointment(id, data) {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update appointment')
  return res.json()
}

export async function deleteAppointment(id) {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete appointment')
  return res.json()
}
