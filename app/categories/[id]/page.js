"use client"

import Image from "next/image"
import ProductCard from "../../../components/product-card"
import ProductCarousel from "../../../components/product-carousel"
import { categories, productsWithCategories } from "../../../lib/data"

export default function CategoryPage({ params }) {
  const category = categories.find((c) => c.id === Number.parseInt(params.id))

  if (!category) {
    return <div className="container mx-auto px-4 py-8">Category not found</div>
  }

  const categoryProducts = productsWithCategories.filter((product) => product.categoryId === category.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-muted/50 rounded-lg p-8 mb-12">
        <div className="flex items-center gap-8 mb-6">
          <Image
            src={category.image || "/placeholder.svg"}
            alt={category.name}
            width={120}
            height={120}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
            <p className="text-xl text-muted-foreground mb-4">{category.description}</p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-8">{category.name} Products</h2>
        {categoryProducts.length > 0 ? (
          <div>
            <ProductCarousel products={categoryProducts} />
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">No products available for this category yet.</p>
        )}
      </section>
    </div>
  )
} 