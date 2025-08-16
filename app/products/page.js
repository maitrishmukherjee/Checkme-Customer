"use client"

import { useState } from "react"
import ProductCard from "../../components/product-card"
import ProductCarousel from "../../components/product-carousel"
import { products } from "../../lib/data"
import { Button } from "../../components/ui/button"
import { useSearchParams } from "next/navigation"

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") || ""

  const categories = ["All", "Apparel", "Accessories", "Digital"]

  let filteredProducts =
    selectedCategory === "All" ? products : products.filter((product) => product.category === selectedCategory)

  if (searchQuery) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Products</h1>

        <div className="flex gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {searchQuery && (
          <p className="text-muted-foreground mb-4">
            Showing results for "{searchQuery}" ({filteredProducts.length} products found)
          </p>
        )}
      </div>

      <div>
        <ProductCarousel products={filteredProducts} />
      </div>
    </div>
  )
}
