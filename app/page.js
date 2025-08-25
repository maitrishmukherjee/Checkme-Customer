"use client"

import HeroBrandCarousel from "../components/hero-brand-carousel"
import CategoryCarousel from "../components/category-carousel"
import ProductCarousel from "../components/product-carousel"
import { getHomepageFeaturedProducts } from "../lib/api"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getHomepageFeaturedProducts()
          const mapped = data.return_data
            .map((raw) => {
              const id = raw?.product_id
              const name = raw?.product_name
              const image = raw?.product_image
              const brandLogo = raw?.brand_logo
              const price = Number(
                raw?.base_price,
              )
              const discountedPrice = Number(
                raw?.sale_price,
              )
              if (!id || !name || !image || !discountedPrice || Number.isNaN(discountedPrice)) {
                return null
              }
              return { id, name, image, brandLogo, price, discountedPrice }
            })
            .filter(Boolean)
          if (mapped.length) {
            setFeatured(mapped)
          }
        }
       catch {}
    })()
  }, [])

  return (
    <div className="min-h-screen">
      <HeroBrandCarousel />
      <CategoryCarousel />
      

      <section className="py-5 md:py-10 max-w-6xl mx-auto lg:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 ">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Products</h2>
            <p className="text-muted-foreground text-lg">Discover our handpicked selection of premium products</p>
          </div>
          <div>
            <ProductCarousel products={featured} />
          </div>
        </div>
      </section>
    </div>
  )
}
