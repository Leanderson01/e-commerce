"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { useCart } from "~/contexts/CartContext";

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
  const { addToCart, isLoading } = useCart();

  const handleAddToCart = async () => {
    if (!isInStock) return;

    try {
      await addToCart(product.id, 1);
    } catch (error) {
      toast.error("Failed to add product to cart");
    }
  };

  return (
    <div className="group relative overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
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

        {/* Action Buttons - Visible on Hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-white hover:bg-gray-100"
            disabled={!isInStock || isLoading}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-white hover:bg-gray-100"
            asChild
          >
            <Link href={`/products/${product.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-white hover:bg-gray-100"
            onClick={() => {
              toast.info("Add to favorites functionality coming soon!");
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-2 pt-3">
        {/* Product Name */}
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
          {product.name}
        </h3>

        {/* Price */}
        <div className="font-semibold text-[#A18A68]">${price.toFixed(2)}</div>

        {/* Stock Info */}
        {isInStock ? (
          <div className="text-xs text-gray-500">
            {product.stockQuantity} in stock
          </div>
        ) : (
          <div className="text-xs text-red-500">Out of stock</div>
        )}
      </div>
    </div>
  );
}
