"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import { brands as fallbackBrands } from "../lib/data"
import { getHomepageBrands } from "../lib/api"

export default function HeroBrandCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [brandItems, setBrandItems] = useState(fallbackBrands)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % brandItems.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [brandItems.length])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const { data } = await getHomepageBrands()
        if (isMounted && Array.isArray(data) && data.length) {
          const mapped = data
            .map((raw) => {
              const id = raw?.id ?? raw?.brand_id
              const name = raw?.name ?? raw?.brand_name
              const bg = raw?.bg ?? raw?.background ?? raw?.banner
              if (!id || !name || !bg) return null
              return { id, name, bg }
            })
            .filter(Boolean)
          if (mapped.length) setBrandItems(mapped)
        }
      } catch {}
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + brandItems.length) % brandItems.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % brandItems.length)
  }

  return (
    <section className=" dark:bg-gray-900 pb-2 flex justify-center relative overflow-hidden">
      <div className="w-full">
        <div className="relative w-full">
          <div className="overflow-hidden shadow-lg">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {brandItems.map((brand) => (
                <div key={brand.id} className="w-full flex-shrink-0">
                  <Link href={`/brands/${brand.id}`} className="block">
                    <div
                      className="relative w-full min-h-[400px] flex items-center justify-center transition-all duration-300 group"
                      style={{
                        backgroundImage: `url(${brand.bg || brand.background || ""})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                        <Button
                          className="bg-white/80 rounded-full backdrop-blur-sm text-gray-900 hover:bg-white text-2xl px-10 py-7 font-semibold"
                        >
                          Explore {brand.name}
                        </Button>
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
            className="absolute rounded-full left-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border border-gray-300 dark:bg-gray-800/90 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 w-12 h-12 text-gray-800 dark:text-gray-200 shadow-xl"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute rounded-full right-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border border-gray-300 dark:bg-gray-800/90 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 w-12 h-12 text-gray-800 dark:text-gray-200 shadow-xl"
            onClick={goToNext}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-3">
            {brandItems.map((_, index) => (
              <button
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-blue-600 scale-110" // Using a specific color for primary
                    : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
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
