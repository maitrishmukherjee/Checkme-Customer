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
      ; (async () => {
        try {
          const { data } = await getProductInfo({ productid: productId })
          const mapped = (() => {
            const raw = data.return_data[0]
            const id = raw?.product_id
            const name = raw?.product_name
            const image = raw?.product_image
            const brandLogo = raw?.brand_logo
            const price = Number(raw?.base_price)
            const discountedPrice = Number(
              raw?.sale_price,
            )
            const description = raw?.product_description
            const images = Array.isArray(raw?.images) && raw.images.length ? raw.images : [image]
            const v_demo = raw?.vdemo
            const p_demo = raw?.pdemo
            return { id, name, image, brandLogo, price, discountedPrice, description, images, v_demo, p_demo }
          })()
          setProduct(mapped)
          setGalleryImages( Array(10).fill(mapped.image))
          setSelectedImage(mapped.images[0] || mapped.image)
          const related = fallbackProducts
            .filter((p) => p.id !== mapped.id)
            .slice(0, 8)
          setRelatedProducts(related)
        } catch (err) {
          console.log(err)
        }
      })()
  }, [productId])

  useEffect(() => {
    if (!thumbApi) return
    const id = setInterval(() => {
      try {
        thumbApi.scrollNext()
      } catch { }
    }, 2500)
    return () => clearInterval(id)
  }, [thumbApi])

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
              src={product.image}
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
                      className={`block w-full rounded-md overflow-hidden border ${src === selectedImage ? "ring-2 ring-primary" : ""
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
            <p className="text-3xl font-bold mb-6">₹ {product.price.toFixed(2)}</p>
          </div>

          <div dangerouslySetInnerHTML={{ __html: product.description }} />



          <div className="flex gap-2 flex-wrap">
            {
              product.v_demo && 
              <Link href={`/demo?product=${product.id}&type=virtual`} className="flex-1">
              <Button className="w-full">
                <PresentationIcon size={20} className="mr-2" />
                Book virtual demo
              </Button>
            </Link>
            }
           
            {product.p_demo && 
            <Link href={`/demo?product=${product.id}&type=physical`} className="flex-1">
              <Button className="w-full">
                <GarageIcon className="mr-2" size={20} />
                Book physical demo
              </Button>
            </Link>
            }
            
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