import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { useCart } from '../context/cartContext.js'
import { useAuth } from '../context/authContext.js'
import { getServices } from '../api/services.js'
import { getCategories } from '../api/categories.js'

function Catalog() {
  const { addItem } = useCart()
  const { coupon } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastAdded, setLastAdded] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [svcData, catData] = await Promise.all([getServices(), getCategories()])
        setServices(svcData)
        setCategories(catData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function handleCategoryToggle(categoryId) {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      }
      return [...prev, categoryId]
    })
  }

  function handleAdd(service) {
    addItem(service)
    setLastAdded(service)
  }

  const filteredServices = selectedCategories.length === 0
    ? services
    : services.filter((s) => selectedCategories.includes(s.category_id))

  if (loading) {
    return (
      <section>
        <h1>Каталог услуг</h1>
        <p className="lead">Загрузка данных с сервера...</p>
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
    <div className="catalog-layout">
      <aside className="catalog-aside">
        <h3>Категории</h3>
        <ul className="aside-categories">
          {categories.map((cat) => (
            <li key={cat.category_id}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.category_id)}
                  onChange={() => handleCategoryToggle(cat.category_id)}
                />
                <span>{cat.category_name}</span>
              </label>
            </li>
          ))}
        </ul>
        {selectedCategories.length > 0 && (
          <button
            type="button"
            className="button ghost small-full"
            onClick={() => setSelectedCategories([])}
          >
            Сбросить фильтр
          </button>
        )}
      </aside>

      <div className="catalog-main">
        <div className="page-head">
          <div>
            <h1>Каталог услуг</h1>
            <p className="lead">Выберите услугу и добавьте её в корзину.</p>
          </div>
        </div>

        {lastAdded && (
          <div className="notice">
            <span>«{lastAdded.service_name}» добавлена в корзину.</span>
            <button type="button" className="button" onClick={() => navigate('/cart')}>
              Перейти в корзину
            </button>
          </div>
        )}

        {coupon && (
          <div className="notice coupon-notice">
            <span>
              Ваша скидка: <strong>{coupon.coupon_code}</strong> — {coupon.discount_percent}%
            </span>
          </div>
        )}

        <div className="grid">
          {filteredServices.map((service) => (
            <ProductCard
              key={service.service_id}
              product={service}
              onAdd={handleAdd}
              userCouponPercent={coupon ? coupon.discount_percent : 0}
            />
          ))}
        </div>

        {filteredServices.length === 0 && (
          <p className="lead">Нет услуг в выбранных категориях.</p>
        )}
      </div>
    </div>
  )
}

export default Catalog
