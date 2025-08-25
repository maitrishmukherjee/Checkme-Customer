"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { useAlert } from "./alert-context"

const UserContext = createContext()

const userReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        accessToken: localStorage.getItem("access_token") || "",
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        accessToken: "",
      }
    case "LOAD_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        accessToken: localStorage.getItem("access_token") || "",
      }
    default:
      return state
  }
}

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
    isAuthenticated: false,
    accessToken: "",
  })
  const { showAlert } = useAlert()

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    const savedToken = localStorage.getItem("access_token")
    if (savedUser) {
      dispatch({ type: "LOAD_USER", payload: JSON.parse(savedUser) })
    }
    if (savedToken) {
      // token will be attached by axios interceptor
    }
  }, [])

  useEffect(() => {
    if (state.user) {
      localStorage.setItem("user", JSON.stringify(state.user))
    } else {
      localStorage.removeItem("user")
    }
  }, [state.user])

  const login = (userData) => {
    dispatch({ type: "LOGIN", payload: userData })
    showAlert(`Welcome back, ${userData.name}!`, "success")
  }

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch({ type: "LOGOUT" })
      showAlert("You have been logged out successfully", "info")
    }
  }

  return (
    <UserContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
