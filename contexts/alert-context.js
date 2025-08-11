"use client"

import { createContext, useContext, useState } from "react"

const AlertContext = createContext()

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([])

  const showAlert = (message, type = "success") => {
    const id = Date.now()
    const alert = { id, message, type }
    setAlerts((prev) => [...prev, alert])

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    }, 3000)
  }

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      {children}
      <AlertContainer />
    </AlertContext.Provider>
  )
}

function AlertContainer() {
  const { alerts, removeAlert } = useContext(AlertContext)

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            alert.type === "success"
              ? "bg-green-500 text-white"
              : alert.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{alert.message}</span>
            <button onClick={() => removeAlert(alert.id)} className="ml-4 text-white hover:text-gray-200">
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider")
  }
  return context
}
