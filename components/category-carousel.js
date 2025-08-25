"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import { categories as fallbackCategories } from "../lib/data"
import { getHomepageCategories } from "../lib/api"

export default function CategoryCarousel() {
  const [api, setApi] = useState(null)
  const [categoryItems, setCategoryItems] = useState(fallbackCategories)

  useEffect(() => {
    if (!api) return
    const interval = setInterval(() => {
      try {
        api.scrollNext()
      } catch {}
    }, 1500)
    return () => clearInterval(interval)
  }, [api])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const { data } = await getHomepageCategories()
        if (isMounted && Array.isArray(data) && data.length) {
          const mapped = data
            .map((raw) => {
              const id = raw?.id ?? raw?.category_id
              const name = raw?.name ?? raw?.category_name
              const image = raw?.image ?? raw?.logo
              if (!id || !name) return null
              return { id, name, image }
            })
            .filter(Boolean)
          if (mapped.length) setCategoryItems(mapped)
        }
      } catch {}
    })()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="py-4 bg-background">
      <div className="text-center mb-12 ">
        <h2 className="text-3xl font-bold text-foreground mb-4">Shop by Category</h2>
        <p className="text-muted-foreground text-lg">Discover our handpicked selection of categories</p>
      </div>
      <div className="container mx-auto px-4">
        <Carousel setApi={setApi} opts={{ loop: true, align: "start" }} className="w-full mx-auto">
          <CarouselContent className="-ml-2 md:-ml-4">
            {categoryItems.map((category) => (
              <CarouselItem key={category.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Link href={`/categories/${category.id}`} className="block h-full">
                  <div className="group bg-muted/50 hover:bg-muted rounded-lg p-3 flex flex-col items-center justify-center text-center transition-colors cursor-pointer h-32 sm:h-36">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-background border flex-shrink-0">
                      <Image
                        src={category.image || category.logo || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    </div>
                    <div className="mt-2 text-xs sm:text-sm font-medium line-clamp-2 px-1 flex-1 flex items-center">
                      <span className="text-center">{category.name}</span>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
            {categoryItems.map((category) => (
              <CarouselItem key={category.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Link href={`/categories/${category.id}`} className="block h-full">
                  <div className="group bg-muted/50 hover:bg-muted rounded-lg p-3 flex flex-col items-center justify-center text-center transition-colors cursor-pointer h-32 sm:h-36">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-background border flex-shrink-0">
                      <Image
                        src={category.image || category.logo || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    </div>
                    <div className="mt-2 text-xs sm:text-sm font-medium line-clamp-2 px-1 flex-1 flex items-center">
                      <span className="text-center">{category.name}</span>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
            {categoryItems.map((category) => (
              <CarouselItem key={category.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Link href={`/categories/${category.id}`} className="block h-full">
                  <div className="group bg-muted/50 hover:bg-muted rounded-lg p-3 flex flex-col items-center justify-center text-center transition-colors cursor-pointer h-32 sm:h-36">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-background border flex-shrink-0">
                      <Image
                        src={category.image || category.logo || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    </div>
                    <div className="mt-2 text-xs sm:text-sm font-medium line-clamp-2 px-1 flex-1 flex items-center">
                      <span className="text-center">{category.name}</span>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 sm:-left-6" />
          <CarouselNext className="-right-3 sm:-right-6" />
        </Carousel>
      </div>
    </section>
  )
}
