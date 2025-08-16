"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import { categories } from "../lib/data"

export default function CategoryCarousel() {
  const [api, setApi] = useState(null)

  useEffect(() => {
    if (!api) return
    const interval = setInterval(() => {
      try {
        api.scrollNext()
      } catch {}
    }, 500)
    return () => clearInterval(interval)
  }, [api])

  return (
    <section className="py-4 bg-background">
      <div className="text-center mb-12 ">
            <h2 className="text-3xl font-bold text-foreground mb-4">Shop by Category</h2>
            <p className="text-muted-foreground text-lg">Discover our handpicked selection of categories</p>
          </div>
      <div className="container mx-auto px-4">
        <Carousel  opts={{ loop: true, align: "start" }} className="w-full mx-auto">
          <CarouselContent className="-ml-4">
            {categories.map((category) => (
              <CarouselItem key={category.id} className="pl-4 basis-1/4">
                <Link href={`/categories/${category.id}`} className="block">
                  <div className="group bg-muted/50 hover:bg-muted rounded-lg p-3 flex flex-col items-center justify-center text-center transition-colors cursor-pointer">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-background border">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        sizes="96px"
                        className="object-contain"
                      />
                    </div>
                    <div className="mt-2 text-xs sm:text-sm font-medium line-clamp-2">{category.name}</div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
           {categories.map((category) => (
              <CarouselItem key={category.id} className="pl-4 basis-1/4">
                <Link href={`/categories/${category.id}`} className="block">
                  <div className="group bg-muted/50 hover:bg-muted rounded-lg p-3 flex flex-col items-center justify-center text-center transition-colors cursor-pointer">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-background border">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        sizes="96px"
                        className="object-contain"
                      />
                    </div>
                    <div className="mt-2 text-xs sm:text-sm font-medium line-clamp-2">{category.name}</div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
            {categories.map((category) => (
              <CarouselItem key={category.id} className="pl-4 basis-1/4">
                <Link href={`/categories/${category.id}`} className="block">
                  <div className="group bg-muted/50 hover:bg-muted rounded-lg p-3 flex flex-col items-center justify-center text-center transition-colors cursor-pointer">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-background border">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        sizes="96px"
                        className="object-contain"
                      />
                    </div>
                    <div className="mt-2 text-xs sm:text-sm font-medium line-clamp-2">{category.name}</div>
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