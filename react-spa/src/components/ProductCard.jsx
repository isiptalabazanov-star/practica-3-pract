import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice.js'
import { getServiceImage } from '../data/serviceImages.js'

function ProductCard({ product, onAdd, userCouponPercent = 0 }) {
  const finalPrice = product.discount_percent
    ? product.price * (1 - product.discount_percent / 100)
    : product.price

  const priceWithCoupon = userCouponPercent > 0
    ? finalPrice * (1 - userCouponPercent / 100)
    : finalPrice

  const hasDiscount = product.discount_percent > 0 || userCouponPercent > 0

  const image = getServiceImage(product)

  return (
    <article className="card">
      <Link to={`/product/${product.service_id}`} className="card-media">
        {image ? (
          <img src={image} alt={product.service_name} loading="lazy" />
        ) : (
          <div className="placeholder-image">{product.service_name}</div>
        )}
      </Link>

      <span className="card-category">{product.category_name || 'Без категории'}</span>

      <h2 className="card-title">
        <Link to={`/product/${product.service_id}`}>{product.service_name}</Link>
      </h2>

      <p className="card-text">{product.description}</p>

      <div className="card-bottom">
        <div className="price-group">
          {hasDiscount && (
            <>
              <span className="price-old">{formatPrice(finalPrice)}</span>
              <span className="price">{formatPrice(priceWithCoupon)}</span>
              {(product.discount_percent > 0 || userCouponPercent > 0) && (
                <span className="discount-badge">
                  {product.discount_percent > 0 ? `-${product.discount_percent}%` : ''}
                  {product.discount_percent > 0 && userCouponPercent > 0 ? ' + ' : ''}
                  {userCouponPercent > 0 ? `-${userCouponPercent}%` : ''}
                </span>
              )}
            </>
          )}
          {!hasDiscount && <span className="price">{formatPrice(finalPrice)}</span>}
        </div>
        <button type="button" className="button" onClick={() => onAdd(product)}>
          В корзину
        </button>
      </div>
    </article>
  )
}

export default ProductCard
