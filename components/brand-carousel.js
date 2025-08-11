"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import { brands } from "../lib/data"

export default function BrandCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % brands.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + brands.length) % brands.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % brands.length)
  }

  return (
    <section className="py-8 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Brands</h2>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {brands.map((brand) => (
                <div key={brand.id} className="w-full flex-shrink-0">
                  <Link href={`/brands/${brand.id}`}>
                    <div className="bg-background rounded-lg p-8 mx-2 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                      <div className="flex items-center justify-center gap-8">
                        <div className="flex-shrink-0">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={120}
                            height={120}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2">{brand.name}</h3>
                          <p className="text-muted-foreground text-lg">{brand.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={goToNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="flex justify-center mt-6 space-x-2">
            {brands.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
