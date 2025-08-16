import ProductCard from "../components/product-card"
import HeroBrandCarousel from "../components/hero-brand-carousel"
import CategoryCarousel from "../components/category-carousel"
import ProductCarousel from "../components/product-carousel"
import { featuredProducts } from "../lib/data"

export default function HomePage() {
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
            <ProductCarousel products={featuredProducts} />
          </div>
        </div>
      </section>
    </div>
  )
}
