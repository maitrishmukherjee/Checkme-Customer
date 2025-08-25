"use client"

import Image from "next/image"
import ProductCard from "../../../components/product-card"
import ProductCarousel from "../../../components/product-carousel"
import { brands, productsWithBrands } from "../../../lib/data"
import HeroBrandCarousel from "@/components/hero-brand-carousel"

export default function BrandPage({ params }) {
  const brand = brands.find((b) => b.id === Number.parseInt(params.id))

  if (!brand) {
    return <div className="container mx-auto px-4 py-8">Brand not found</div>
  }

  const brandProducts = productsWithBrands.filter((product) => product.brandId === brand.id)

  return (
    <div className="container mx-auto">
      {/* Brand Header */}
      <HeroBrandCarousel/>
      <div className="bg-muted/50 rounded-lg p-8 mb-12">
        <div className="flex items-center gap-8 mb-6">
          <Image
            src={brand.logo || "/placeholder.svg"}
            alt={brand.name}
            width={120}
            height={120}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-4xl font-bold mb-2">{brand.name}</h1>
            <p className="text-xl text-muted-foreground mb-4">{brand.description}</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span>Founded: {brand.founded}</span>
              <span>Headquarters: {brand.headquarters}</span>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">About {brand.name}</h2>
          <p className="text-muted-foreground leading-relaxed">{brand.about}</p>
        </div>
      </div>

      {/* Brand Products */}
      <section>
        <h2 className="text-2xl font-bold mb-8">{brand.name} Products</h2>
        {brandProducts.length > 0 ? (
          <div>
            <ProductCarousel products={brandProducts} />
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">No products available for this brand yet.</p>
        )}
      </section>
    </div>
  )
}
