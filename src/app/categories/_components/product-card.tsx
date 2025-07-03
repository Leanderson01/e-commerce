"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: string;
  description?: string | null;
  stockQuantity?: number | null;
  imageUrl?: string | null;
  categoryId?: string | null;
  _category?: {
    id: string;
    name: string;
  } | null;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const price = parseFloat(product.price);
  const isInStock = product.stockQuantity && product.stockQuantity > 0;

  return (
    <Card className="group overflow-hidden">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-gray-400">No Image</span>
            </div>
          )}

          {/* Stock Badge */}
          {!isInStock && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-3 p-4">
          {/* Category */}
          {product._category && (
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              {product._category.name}
            </p>
          )}

          {/* Product Name */}
          <h3 className="line-clamp-2 font-semibold">{product.name}</h3>

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">${price.toFixed(2)}</span>

            {/* Stock Info */}
            {isInStock && (
              <span className="text-muted-foreground text-xs">
                {product.stockQuantity} in stock
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/products/${product.id}`}>View Details</Link>
            </Button>

            <Button
              className="flex-1"
              disabled={!isInStock}
              onClick={() => {
                toast.info("Add to cart functionality coming soon!");
              }}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
