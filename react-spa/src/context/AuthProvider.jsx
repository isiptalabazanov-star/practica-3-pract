import { useMemo, useState } from 'react'
import { AuthContext } from './authContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function login(userData) {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setError('')
  }

  function checkSession() {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }

  const value = useMemo(() => ({
    user,
    loading,
    error,
    setError,
    login,
    logout,
    checkSession,
    isAdmin: user ? user.role_id === 1 : false,
    coupon: user ? user.coupon : null,
  }), [user, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
