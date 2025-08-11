"use client"

import Link from "next/link"
import { Search, User, ShoppingCart, Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useCart } from "../contexts/cart-context"
import { useUser } from "../contexts/user-context"
import { useTheme } from "../contexts/theme-context"
import { useState } from "react"
import Image from "next/image"

export default function Navigation() {
  const { getCartItemsCount } = useCart()
  const { user, isAuthenticated } = useUser()
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const cartItemsCount = getCartItemsCount()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
         
         <div className="flex gap-10 items-center">
           <Link href="/" className="text-xl font-bold">
           <Image src='/checkme-web.jpeg' alt='checkme'
                            width={120}
                            height={120}
                            className="rounded-lg" />
            
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-muted-foreground font-medium hover:font-semibold duration-300 hover:text-foreground">
              All Products
            </Link>
          </nav>
         </div>
         

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {isAuthenticated ? (
              <Link href="/profile" className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="ghost" size="icon" className="relative">
                  {user?.picture ? (
                    <img src={user.picture || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}

            {/* <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link> */}
          </div>
        </div>
      </div>
    </header>
  )
}
