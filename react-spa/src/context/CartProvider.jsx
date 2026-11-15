import { useMemo, useReducer } from 'react'
import { CartContext } from './cartContext.js'

const initialState = {
  items: [],
}

function getItemId(item) {
  return item.service_id || item.id
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'cart/add': {
      const existing = state.items.find((item) => getItemId(item) === getItemId(action.payload))

      if (existing) {
        return {
          items: state.items.map((item) =>
            getItemId(item) === getItemId(action.payload)
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }
      }

      return {
        items: [...state.items, { ...action.payload, quantity: 1 }],
      }
    }
    case 'cart/decrease': {
      const target = state.items.find((item) => getItemId(item) === action.payload)

      if (!target) {
        return state
      }

      if (target.quantity === 1) {
        return {
          items: state.items.filter((item) => getItemId(item) !== action.payload),
        }
      }

      return {
        items: state.items.map((item) =>
          getItemId(item) === action.payload ? { ...item, quantity: item.quantity - 1 } : item,
        ),
      }
    }
    case 'cart/remove':
      return {
        items: state.items.filter((item) => getItemId(item) !== action.payload),
      }
    case 'cart/clear':
      return {
        items: [],
      }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const value = useMemo(() => {
    const total = state.items.reduce((sum, item) => {
      const price = item.discount_percent
        ? item.price * (1 - item.discount_percent / 100)
        : item.price
      return sum + price * item.quantity
    }, 0)
    const count = state.items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      items: state.items,
      count,
      total,
      addItem: (product) => dispatch({ type: 'cart/add', payload: product }),
      decreaseItem: (id) => dispatch({ type: 'cart/decrease', payload: id }),
      removeItem: (id) => dispatch({ type: 'cart/remove', payload: id }),
      clearCart: () => dispatch({ type: 'cart/clear' }),
    }
  }, [state.items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
