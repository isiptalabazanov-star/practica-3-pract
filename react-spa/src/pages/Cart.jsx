import { Link } from 'react-router-dom'
import { useCart } from '../context/cartContext.js'
import { useAuth } from '../context/authContext.js'
import { formatPrice } from '../utils/formatPrice.js'
import { createAppointment } from '../api/appointments.js'
import { createPayment } from '../api/payments.js'

function Cart() {
  const { items, total, addItem, decreaseItem, removeItem, clearCart } = useCart()
  const { user, coupon: userCoupon } = useAuth()

  function getServicePrice(item) {
    let price = item.price
    if (item.discount_percent) {
      price = price * (1 - item.discount_percent / 100)
    }
    if (userCoupon) {
      price = price * (1 - userCoupon.discount_percent / 100)
    }
    return price
  }

  function getOriginalPrice(item) {
    return item.price * (item.discount_percent ? (1 - item.discount_percent / 100) : 1)
  }

  const finalTotal = items.reduce((sum, item) => sum + getServicePrice(item) * item.quantity, 0)
  const originalTotal = items.reduce((sum, item) => sum + getOriginalPrice(item) * item.quantity, 0)
  const totalDiscount = originalTotal - finalTotal

  async function handleCheckout() {
    if (!user) {
      alert('Для оформления заказа необходимо авторизоваться')
      return
    }
    try {
      const appointments = []
      const appointmentIds = []
      for (const item of items) {
        const appt = await createAppointment({
          user_id: user.user_id,
          service_id: item.service_id,
          appointment_time: new Date(Date.now() + 86400000).toISOString(),
        })
        appointmentIds.push(appt.appointment_id)
        appointments.push(appt)
      }
      for (const appt of appointments) {
        await createPayment({
          appointment_id: appt.appointment_id,
          user_id: user.user_id,
          amount: getServicePrice(items[appointments.indexOf(appt)]) * items[appointments.indexOf(appt)].quantity,
          payment_method: 'card',
        })
      }
      clearCart()
      alert('Заказ успешно оформлен!')
    } catch (err) {
      alert('Ошибка при оформлении: ' + err.message)
    }
  }

  if (items.length === 0) {
    return (
      <section className="empty">
        <h1>Корзина пуста</h1>
        <p className="lead">Добавьте услуги из каталога, чтобы оформить заказ.</p>
        <Link to="/" className="button">
          Перейти в каталог
        </Link>
      </section>
    )
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Корзина</h1>
          <p className="lead">Проверьте состав заказа и удалите лишнее.</p>
        </div>
        <button type="button" className="button ghost" onClick={clearCart}>
          Очистить корзину
        </button>
      </div>

      <div className="cart">
        <div className="cart-head">
          <span>Услуга</span>
          <span>Сумма</span>
          <span>Количество</span>
        </div>

        {items.map((item) => (
          <div className="cart-row" key={item.service_id}>
            <div className="cart-info">
              <div className="cart-text">
                <span className="cart-name">
                  {item.service_name} ×{item.quantity}
                </span>
                <span className="cart-category">{item.category_name || 'Без категории'}</span>
              </div>
            </div>
            <div className="cart-price-cell">
              {item.discount_percent > 0 && (
                <span className="price-old">{formatPrice(item.price)}</span>
              )}
              <span className="price">{formatPrice(getServicePrice(item) * item.quantity)}</span>
            </div>
            <div className="cart-controls">
              <button
                type="button"
                className="button ghost small"
                onClick={() => decreaseItem(item.service_id)}
              >
                −
              </button>
              <button type="button" className="button ghost small" onClick={() => addItem(item)}>
                +
              </button>
              <button type="button" className="button danger" onClick={() => removeItem(item.service_id)}>
                Удалить
              </button>
            </div>
          </div>
        ))}

        <div className="cart-total">
          <div className="cart-total-info">
            <span>Итого</span>
            {totalDiscount > 0 && (
              <>
                <span className="price-old">{formatPrice(originalTotal)}</span>
                <span className="discount-summary">Скидка: {formatPrice(totalDiscount)}</span>
              </>
            )}
          </div>
          <span className="price large">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {userCoupon && (
        <div className="notice coupon-notice">
          <span>
            Применяется купон: <strong>{userCoupon.coupon_code}</strong> — {userCoupon.discount_percent}%
          </span>
        </div>
      )}

      <div className="actions">
        <Link to="/" className="button ghost">
          Продолжить покупки
        </Link>
        <button type="button" className="button" onClick={handleCheckout}>
          Оформить заказ
        </button>
      </div>
    </section>
  )
}

export default Cart
