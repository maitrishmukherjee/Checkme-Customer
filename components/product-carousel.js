"use client"

import { useEffect, useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import ProductCard from "./product-card"

export default function ProductCarousel({ products }) {
  const [api, setApi] = useState(null)

  useEffect(() => {
    if (!api) return
    const interval = setInterval(() => {
      try {
        api.scrollNext()
      } catch {}
    }, 4000)
    return () => clearInterval(interval)
  }, [api])

  return (
    <Carousel setApi={setApi} opts={{ loop: true, align: "start" }}>
      <CarouselContent className="-ml-4">
        {products.map((product) => (
          <CarouselItem key={product.id} className="pl-4 basis-full md:basis-1/3 lg:basis-1/4">
            <ProductCard product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-3 sm:-left-6" />
      <CarouselNext className="-right-3 sm:-right-6" />
    </Carousel>
  )
} 