import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../context/cartContext.js'
import { useAuth } from '../context/authContext.js'
import { getService } from '../api/services.js'
import { getServiceImage } from '../data/serviceImages.js'
import { formatPrice } from '../utils/formatPrice.js'

function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { coupon: userCoupon } = useAuth()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchService() {
      try {
        const data = await getService(id)
        setService(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchService()
  }, [id])

  if (loading) {
    return (
      <section>
        <h1>{service ? service.service_name : 'Загрузка...'}</h1>
        <p className="lead">Загрузка данных об услуге...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="empty">
        <h1>Ошибка</h1>
        <p className="form-error">{error}</p>
        <Link to="/" className="button">
          Вернуться в каталог
        </Link>
      </section>
    )
  }

  if (!service) {
    return (
      <section className="empty">
        <h1>Услуга не найдена</h1>
        <p className="lead">Возможно, ссылка устарела или услуга была удалена.</p>
        <Link to="/" className="button">
          Вернуться в каталог
        </Link>
      </section>
    )
  }

  const finalPrice = service.discount_percent
    ? service.price * (1 - service.discount_percent / 100)
    : service.price

  const priceWithCoupon = userCoupon
    ? finalPrice * (1 - userCoupon.discount_percent / 100)
    : finalPrice

  const hasDiscount = service.discount_percent > 0 || userCoupon

  const image = getServiceImage(service)

  function handleAdd() {
    addItem(service)
    navigate('/cart')
  }

  return (
    <section className="product">
      <div className="product-media">
        {image ? (
          <img src={image} alt={service.service_name} />
        ) : (
          <div className="placeholder-image-large">{service.service_name}</div>
        )}
      </div>

      <div className="product-info">
        <span className="card-category">{service.category_name || 'Без категории'}</span>
        <h1>{service.service_name}</h1>
        <p className="lead">{service.description}</p>

        <ul className="specs">
          <li>Длительность: {service.duration_min} минут</li>
          {service.discount_percent > 0 && (
            <li>Скидка: {service.discount_percent}%</li>
          )}
        </ul>

        <div className="product-bottom">
          <div className="price-group">
            {hasDiscount && (
              <>
                <span className="price-old">{formatPrice(finalPrice)}</span>
                <span className="price large">{formatPrice(priceWithCoupon)}</span>
              </>
            )}
            {!hasDiscount && <span className="price large">{formatPrice(finalPrice)}</span>}
          </div>
          <button type="button" className="button" onClick={handleAdd}>
            В корзину
          </button>
        </div>

        <Link to="/" className="back-link">
          Назад в каталог
        </Link>
      </div>
    </section>
  )
}

export default ProductPage
