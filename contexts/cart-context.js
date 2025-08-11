"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { useAlert } from "./alert-context"

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((item) => (item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item))
          .filter((item) => item.quantity > 0),
      }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      }

    case "LOAD_CART":
      return {
        ...state,
        items: action.payload,
      }

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  const { showAlert } = useAlert()

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      dispatch({ type: "LOAD_CART", payload: JSON.parse(savedCart) })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items))
  }, [state.items])

  const addToCart = (product) => {
    const existingItem = state.items.find((item) => item.id === product.id)
    dispatch({ type: "ADD_TO_CART", payload: product })

    if (existingItem) {
      showAlert(`Increased ${product.name} quantity`, "success")
    } else {
      showAlert(`${product.name} added to cart`, "success")
    }
  }

  const removeFromCart = (productId) => {
    const item = state.items.find((item) => item.id === productId)
    dispatch({ type: "REMOVE_FROM_CART", payload: productId })
    if (item) {
      showAlert(`${item.name} removed from cart`, "info")
    }
  }

  const updateQuantity = (productId, quantity) => {
    const item = state.items.find((item) => item.id === productId)
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: productId, quantity } })
    if (item && quantity === 0) {
      showAlert(`${item.name} removed from cart`, "info")
    } else if (item) {
      showAlert(`${item.name} quantity updated`, "success")
    }
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartItemsCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
