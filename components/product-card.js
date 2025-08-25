"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useCart } from "../contexts/cart-context";
import {
  AmazonLogoIcon,
  GarageIcon,
  InfoIcon,
  PresentationIcon,
} from "@phosphor-icons/react";

export default function ProductCard({ product, showDemo = true }) {
  const { addToCart } = useCart();
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Card className="group overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-[var(--color-background)] ">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex flex-col gap-1 items-start">
          <img
className="w-auto h-8 rounded-full"
            src={product.brandLogo || "/placeholder.svg"}
            alt={product.brandLogo || "/placeholder.svg"}
          />
        
          <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-gray-600">
            <span className="hidden lg:block">
              {product.name.length > 20
                ? `${product.name.slice(0, 20)}...`
                : product.name}
            </span>

            <span className="hidden md:block lg:hidden">
              {product.name.length > 18
                ? `${product.name.slice(0, 18)}...`
                : product.name}
            </span>
            <span className="block md:hidden">{product.name}</span>
          </h3>
        </Link>
        </div>
        
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold">
              {" "}
              ₹{product.discountedPrice.toFixed(2)}
            </p>
            {/* <p className="text-sm text-red-500 line-through">
              {" "}
              ₹{product.price.toFixed(2)}
            </p> */}
          </div>
          {/* <p className="text-sm font-semibold text-gray-500">
            Discount: {product.discountPercentage}%
          </p> */}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/demo?product=${product.id}`} className="flex-1">
            <Button className="w-full">
              <PresentationIcon size={20} className="mr-2" />
              Book virtual demo
            </Button>
          </Link>
          {showDemo && (
            <Link href={`/demo?product=${product.id}`} className="flex-1">
              <Button className="w-full">
                <GarageIcon className="mr-2" size={20} />
                Book physical demo
              </Button>
            </Link>
          )}
          <Link href={`/products/${product.id}`} className="flex-1">
            <Button className="w-full">
              <InfoIcon size={20} className="mr-2" />
              More Info
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
