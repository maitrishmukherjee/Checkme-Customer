"use client"

import HeroBrandCarousel from "../components/hero-brand-carousel"
import CategoryCarousel from "../components/category-carousel"
import ProductCarousel from "../components/product-carousel"
import { featuredProducts as fallbackFeatured } from "../lib/data"
import { getHomepageFeaturedProducts } from "../lib/api"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [featured, setFeatured] = useState(fallbackFeatured)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const { data } = await getHomepageFeaturedProducts()
        if (isMounted && Array.isArray(data) && data.length) {
          const mapped = data
            .map((raw) => {
              const id = raw?.id ?? raw?.product_id ?? raw?.productid
              const name = raw?.name ?? raw?.product_name ?? raw?.title
              const image = raw?.image ?? raw?.image_url ?? raw?.thumbnail
              const brandLogo = raw?.brandLogo ?? raw?.brand_logo ?? ""
              const price = Number(
                raw?.price ?? raw?.mrp ?? raw?.discountedPrice ?? raw?.discount_price ?? 0,
              )
              const discountedPrice = Number(
                raw?.discountedPrice ?? raw?.discount_price ?? raw?.price ?? 0,
              )
              const description = raw?.description ?? ""
              if (!id || !name || !image || !discountedPrice || Number.isNaN(discountedPrice)) {
                return null
              }
              return { id, name, image, brandLogo, price, discountedPrice, description }
            })
            .filter(Boolean)
          if (mapped.length) {
            setFeatured(mapped)
          }
        }
      } catch {}
    })()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen">
      <HeroBrandCarousel />
      <CategoryCarousel />
      

      <section className="py-5 md:py-10 lg:py-16 bg-background">
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
