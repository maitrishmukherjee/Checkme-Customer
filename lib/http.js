import axios from "axios"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"

export const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  },
)

export default http


