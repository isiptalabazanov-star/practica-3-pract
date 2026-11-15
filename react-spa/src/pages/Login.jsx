import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'
import { login as apiLogin } from '../api/auth.js'

function Login() {
  const navigate = useNavigate()
  const { login, setError: setAuthError, error: authError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.email.trim() || !form.password.trim()) {
      setError('Заполните электронную почту и пароль')
      return
    }

    setLoading(true)
    setError('')

    try {
      const userData = await apiLogin(form.email, form.password)
      login(userData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <h1>Вход</h1>
        <p className="lead">Введите данные для авторизации.</p>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Электронная почта</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user@example.com"
            />
          </label>

          <label className="field">
            <span>Пароль</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Введите пароль"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Login
