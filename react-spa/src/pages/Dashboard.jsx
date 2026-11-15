import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/cartContext.js'
import { useAuth } from '../context/authContext.js'
import { getUsers } from '../api/users.js'
import { getDiscountCoupons } from '../api/discounts.js'
import { getServices } from '../api/services.js'
import { createCoupon } from '../api/discounts.js'
import { createCategory } from '../api/categories.js'
import { getCategories } from '../api/categories.js'
import { assignCouponToUser } from '../api/users.js'
import { deleteCoupon } from '../api/discounts.js'
import { deleteService } from '../api/services.js'
import { deleteCategory } from '../api/categories.js'
import { formatPrice } from '../utils/formatPrice.js'

function Dashboard() {
  const { count, total } = useCart()
  const { user, logout, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [coupons, setCoupons] = useState([])
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('profile')
  const [newCouponCode, setNewCouponCode] = useState('')
  const [newCouponPercent, setNewCouponPercent] = useState('')
  const [newCouponDesc, setNewCouponDesc] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersData, couponsData, servicesData, categoriesData] = await Promise.all([
          getUsers(),
          getDiscountCoupons(),
          getServices(),
          getCategories(),
        ])
        setUsers(usersData)
        setCoupons(couponsData)
        setServices(servicesData)
        setCategories(categoriesData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleCreateCoupon() {
    try {
      await createCoupon({
        coupon_code: newCouponCode,
        discount_percent: parseInt(newCouponPercent),
        description: newCouponDesc,
      })
      const updated = await getDiscountCoupons()
      setCoupons(updated)
      setNewCouponCode('')
      setNewCouponPercent('')
      setNewCouponDesc('')
      setMessage('Купон создан')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteCoupon(id) {
    try {
      await deleteCoupon(id)
      setCoupons((prev) => prev.filter((c) => c.coupon_id !== id))
      setMessage('Купон удалён')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleAssignCoupon() {
    if (!selectedUserId) {
      setError('Выберите пользователя')
      return
    }
    try {
      await assignCouponToUser(parseInt(selectedUserId), null)
      const updated = await getUsers()
      setUsers(updated)
      setMessage('Купон снят')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCreateCategory() {
    try {
      await createCategory(newCategoryName)
      const updated = await getCategories()
      setCategories(updated)
      setNewCategoryName('')
      setMessage('Категория создана')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteService(id) {
    try {
      await deleteService(id)
      setServices((prev) => prev.filter((s) => s.service_id !== id))
      setMessage('Услуга удалена')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteCategory(id) {
    try {
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.category_id !== id))
      setMessage('Категория удалена')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <section>
        <h1>Личный кабинет</h1>
        <p className="lead">Загрузка данных...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h1>Ошибка</h1>
        <p className="form-error">{error}</p>
        <button type="button" className="button" onClick={() => window.location.reload()}>
          Повторить
        </button>
      </section>
    )
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Личный кабинет</h1>
          <p className="lead">{user ? user.email : 'Вы не авторизованы'}</p>
        </div>
        <button type="button" className="button ghost" onClick={logout}>
          Выйти
        </button>
      </div>

      {message && (
        <div className="notice">
          <span>{message}</span>
          <button type="button" className="button ghost small" onClick={() => setMessage('')}>
            ×
          </button>
        </div>
      )}

      <div className="stats">
        <div className="stat">
          <span className="stat-label">Товаров в корзине</span>
          <span className="stat-value">{count}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Сумма заказа</span>
          <span className="stat-value">{formatPrice(total)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Роль</span>
          <span className="stat-value">{user ? (user.role_id === 1 ? 'Админ' : 'Пользователь') : '—'}</span>
        </div>
        {user && user.coupon && (
          <div className="stat">
            <span className="stat-label">Ваш купон</span>
            <span className="stat-value">{user.coupon.coupon_code} ({user.coupon.discount_percent}%)</span>
          </div>
        )}
      </div>

      <div className="actions">
        <Link to="/cart" className="button">
          Открыть корзину
        </Link>
        <Link to="/" className="button ghost">
          Перейти в каталог
        </Link>
      </div>

      {isAdmin && (
        <div className="admin-panel">
          <div className="admin-tabs">
            <button
              type="button"
              className={tab === 'profile' ? 'admin-tab active' : 'admin-tab'}
              onClick={() => setTab('profile')}
            >
              Пользователи
            </button>
            <button
              type="button"
              className={tab === 'coupons' ? 'admin-tab active' : 'admin-tab'}
              onClick={() => setTab('coupons')}
            >
              Купоны
            </button>
            <button
              type="button"
              className={tab === 'services' ? 'admin-tab active' : 'admin-tab'}
              onClick={() => setTab('services')}
            >
              Услуги
            </button>
            <button
              type="button"
              className={tab === 'categories' ? 'admin-tab active' : 'admin-tab'}
              onClick={() => setTab('categories')}
            >
              Категории
            </button>
          </div>

          {tab === 'profile' && (
            <div className="admin-section">
              <h3>Управление пользователями</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Имя</th>
                    <th>Роль</th>
                    <th>Купон</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id}>
                      <td>{u.user_id}</td>
                      <td>{u.email}</td>
                      <td>{u.full_name}</td>
                      <td>{u.role_name}</td>
                      <td>
                        {u.coupon_code
                          ? `${u.coupon_code} (${u.discount_percent}%)`
                          : 'Нет'}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={handleAssignCoupon}
                          disabled={!selectedUserId || selectedUserId !== String(u.user_id)}
                        >
                          Снять купон
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="admin-form-inline">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="field-select"
                >
                  <option value="">Выберите пользователя</option>
                  {users.filter((u) => u.role_id === 2).map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {tab === 'coupons' && (
            <div className="admin-section">
              <h3>Управление купонами</h3>
              <div className="admin-form">
                <div className="admin-form-row">
                  <input
                    type="text"
                    placeholder="Код купона"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="admin-input"
                  />
                  <input
                    type="number"
                    placeholder="Скидка %"
                    value={newCouponPercent}
                    onChange={(e) => setNewCouponPercent(e.target.value)}
                    className="admin-input"
                    min="1"
                    max="100"
                  />
                  <input
                    type="text"
                    placeholder="Описание"
                    value={newCouponDesc}
                    onChange={(e) => setNewCouponDesc(e.target.value)}
                    className="admin-input"
                  />
                  <button type="button" className="button" onClick={handleCreateCoupon}>
                    Создать
                  </button>
                </div>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Код</th>
                    <th>Скидка</th>
                    <th>Описание</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.coupon_id}>
                      <td>{c.coupon_code}</td>
                      <td>{c.discount_percent}%</td>
                      <td>{c.description}</td>
                      <td>
                        <button
                          type="button"
                          className="button danger small"
                          onClick={() => handleDeleteCoupon(c.coupon_id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'services' && (
            <div className="admin-section">
              <h3>Управление услугами</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Длительность</th>
                    <th>Цена</th>
                    <th>Скидка</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.service_id}>
                      <td>{s.service_id}</td>
                      <td>{s.service_name}</td>
                      <td>{s.category_name || '—'}</td>
                      <td>{s.duration_min} мин</td>
                      <td>{formatPrice(s.price)}</td>
                      <td>{s.discount_percent > 0 ? `${s.discount_percent}%` : '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="button danger small"
                          onClick={() => handleDeleteService(s.service_id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'categories' && (
            <div className="admin-section">
              <h3>Управление категориями</h3>
              <div className="admin-form">
                <div className="admin-form-row">
                  <input
                    type="text"
                    placeholder="Название категории"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="admin-input"
                  />
                  <button type="button" className="button" onClick={handleCreateCategory}>
                    Добавить
                  </button>
                </div>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.category_id}>
                      <td>{c.category_id}</td>
                      <td>{c.category_name}</td>
                      <td>
                        <button
                          type="button"
                          className="button danger small"
                          onClick={() => handleDeleteCategory(c.category_id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default Dashboard
