"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "../../../components/ui/button"
import ProductCarousel from "../../../components/product-carousel"
import { useCart } from "../../../contexts/cart-context"
import { AmazonLogoIcon, GarageIcon, PresentationIcon } from "@phosphor-icons/react"
import React, { useEffect, useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../components/ui/carousel"
import { getProductInfo } from "../../../lib/api"
import { products as fallbackProducts } from "../../../lib/data"

export default function ProductPage({ params }) {
  // ✅ All hooks are called at the very top, unconditionally.
  const { addToCart } = useCart()
  const productId = Number.parseInt(params?.id)
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [galleryImages, setGalleryImages] = useState([])
  const [selectedImage, setSelectedImage] = useState("")
  const [thumbApi, setThumbApi] = useState(null)
  const [isZooming, setIsZooming] = useState(false)
  const [zoomState, setZoomState] = useState({ x: 0, y: 0, w: 0, h: 0 })

  useEffect(() => {
    if (!productId) return
    let isMounted = true
    ;(async () => {
      try {
        const { data } = await getProductInfo({ productid: productId })
        // Map API response to UI shape
        const mapped = (() => {
          const raw = data
          const id = raw?.id ?? raw?.product_id ?? productId
          const name = raw?.name ?? raw?.product_name ?? raw?.title ?? ""
          const image = raw?.image ?? raw?.image_url ?? raw?.thumbnail ?? "/placeholder.svg"
          const brandLogo = raw?.brandLogo ?? raw?.brand_logo ?? ""
          const price = Number(raw?.price ?? raw?.mrp ?? raw?.discountedPrice ?? raw?.discount_price ?? 0)
          const discountedPrice = Number(
            raw?.discountedPrice ?? raw?.discount_price ?? raw?.price ?? 0,
          )
          const description = raw?.description ?? ""
          const images = Array.isArray(raw?.images) && raw.images.length ? raw.images : [image]
          return { id, name, image, brandLogo, price, discountedPrice, description, images }
        })()
        if (!isMounted) return
        setProduct(mapped)
        setGalleryImages(mapped.images)
        setSelectedImage(mapped.images[0])

        // naive related products from fallback by name/category hints
        const related = fallbackProducts
          .filter((p) => p.id !== mapped.id)
          .slice(0, 8)
        setRelatedProducts(related)
      } catch (err) {
        // fallback to mock if API fails
        const fallback = fallbackProducts.find((p) => p.id === productId)
        if (fallback && isMounted) {
          setProduct({ ...fallback, images: [fallback.image] })
          setGalleryImages([fallback.image])
          setSelectedImage(fallback.image)
          setRelatedProducts(
            fallbackProducts.filter((p) => p.id !== fallback.id).slice(0, 8),
          )
        }
      }
    })()
    return () => {
      isMounted = false
    }
  }, [productId])

  useEffect(() => {
    if (!thumbApi) return
    const id = setInterval(() => {
      try {
        thumbApi.scrollNext()
      } catch {}
    }, 2500)
    return () => clearInterval(id)
  }, [thumbApi])

  // ✅ The conditional return must come after all hook calls.
  if (!product) {
    return <div className="container mx-auto px-4 py-8">Loading product...</div>
  }

  const ZOOM = 2.5

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setZoomState({ x, y, w: rect.width, h: rect.height })
  }

  const bgPosX = -(zoomState.x * ZOOM - zoomState.w / 2)
  const bgPosY = -(zoomState.y * ZOOM - zoomState.h / 2)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <div className="relative">
          <div
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={selectedImage}
              alt={product.name}
              width={800}
              height={800}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-4">
            <Carousel setApi={setThumbApi} opts={{ loop: true, align: "start" }}>
              <CarouselContent className="-ml-2">
                {galleryImages.map((src, idx) => (
                  <CarouselItem key={idx} className="pl-2 basis-1/4 md:basis-1/6 lg:basis-1/6">
                    <button
                      type="button"
                      onClick={() => setSelectedImage(src)}
                      className={`block w-full rounded-md overflow-hidden border ${
                        src === selectedImage ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <Image src={src} alt={`${product.name} ${idx + 1}`} width={120} height={120} className="w-full h-auto object-contain" />
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-3" />
              <CarouselNext className="-right-3" />
            </Carousel>
          </div>
        </div>

        <div className="space-y-6">
          {isZooming && (
            <div className="hidden lg:block">
              <div className="aspect-square rounded-lg border bg-white overflow-hidden">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${selectedImage})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${zoomState.w * ZOOM}px ${zoomState.h * ZOOM}px`,
                    backgroundPosition: `${-(zoomState.x * ZOOM - zoomState.w / 2)}px ${-(zoomState.y * ZOOM - zoomState.h / 2)}px`,
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold mb-4 flex gap-2">
               <img
className="w-auto h-8 rounded-full"
            src={product.brandLogo || "/placeholder.svg"}
            alt={product.brandLogo || "/placeholder.svg"}
          />
          {product.name}</h1>
            <p className="text-3xl font-bold mb-6">${product.price.toFixed(2)}</p>
          </div>

          <p className=" text-lg leading-relaxed">{product.description}</p>

          <ul className="list-disc ml-6">
            <li>Removes stains like a pro: SpotClean® ProHeat combines powerful vacuum suction, brushing action & cleaning solution to remove dirt & stains. This professional spot cleaner uses water, BISSELL® formula & powerful suction to clean & protect surfaces.</li>
            <li>Cleans anywhere, anytime: From carpets and rugs to upholstery, car interiors & more, you have the ideal cleaner in the SpotClean® ProHeat. It has a carry handle & its on-board hose is 1.5M long to allow you to clean anywhere at any time.</li>
            <li>Powers through the mess: Be prepared for unexpected messes with the convenience of SpotClean® ProHeat. It quickly removes spots, spills and stains with superior suction and large removable water tanks. Powerful performance with 750W of power.</li>
            <li>Easy to use: SpotClean® ProHeat has an easy grip and a large capacity flat (2.8L) fill tanks that allow for quick fill and easy empty. Its lightweight, portable and compact design is ideal for storage in small spaces.</li>
            <li>The real deal: It includes an 8 cm Tough Stain Tool, a large 15 cm Tough Stain Brush & a sample bottle of BISSELL® formula. Its broader brush head and larger, longer hose with slightly more power boosts the performance beyond the rest of the range.</li>
          </ul>

          <div className="flex gap-2 flex-wrap">
            <Link href={`/demo?product=${product.id}&type=virtual`} className="flex-1">
              <Button className="w-full">
                <PresentationIcon size={20} className="mr-2" />
                Book virtual demo
              </Button>
            </Link>
            <Link href={`/demo?product=${product.id}&type=physical`} className="flex-1">
              <Button className="w-full">
                <GarageIcon className="mr-2" size={20} />
                Book physical demo
              </Button>
            </Link>
            <Link href='#' className="flex-1">
              <Button className="w-full">
                <AmazonLogoIcon className="mr-2" size={20} />
                Buy From Amazon
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
          <ProductCarousel products={relatedProducts} />
        </section>
      )}
    </div>
  )
}