import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "../contexts/cart-context"
import { UserProvider } from "../contexts/user-context"
import { ThemeProvider } from "../contexts/theme-context"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AlertProvider } from "../contexts/alert-context"
import Navigation from "../components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "CheckMe",
  description: "Buy the most premium appliances at CheckMe",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId="716441307947-2mrjvnvq1n53pp2pvlh49vrr9s8cklv1.apps.googleusercontent.com">
          <ThemeProvider>
            <AlertProvider>
              <UserProvider>
                <CartProvider>
                  <div className="max-w-6xl mx-auto">
                    <Navigation />
                    <main>{children}</main>
                  </div>
                </CartProvider>
              </UserProvider>
            </AlertProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
