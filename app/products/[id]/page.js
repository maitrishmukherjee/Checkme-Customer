"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "../../../components/ui/button"
import ProductCard from "../../../components/product-card"
import { products } from "../../../lib/data"
import { useCart } from "../../../contexts/cart-context"
import { AmazonLogoIcon, GarageIcon, PresentationIcon } from "@phosphor-icons/react"

export default function ProductPage({ params }) {
  const { addToCart } = useCart()
  const product = products.find((p) => p.id === Number.parseInt(params.id))

  if (!product) {
    return <div>Product not found</div>
  }

  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  const handleAddToCart = () => {
    addToCart(product)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>

       <div className="space-y-6">
  <div>
    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
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
    <Link href={`/demo?product=${product.id}`} className="flex-1">
      <Button className="w-full">
        <PresentationIcon size={20} className="mr-2" />
        Book virtual demo
      </Button>
    </Link>
    <Link href={`/demo?product=${product.id}`} className="flex-1">
      <Button  className="w-full">
        <GarageIcon className="mr-2" size={20} />
        Book physical demo
      </Button>
    </Link>
    <Link href='#' className="flex-1">
      <Button  className="w-full">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
