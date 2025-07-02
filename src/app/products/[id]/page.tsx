"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Minus,
  Plus,
  ShoppingCart,
  ArrowLeft,
  Heart,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const socialLinks = [
    { name: "Facebook", href: "#", src: "/icons/face.png" },
    { name: "Instagram", href: "#", src: "/icons/insta.png" },
    { name: "Twitter", href: "#", src: "/icons/x.png" },
    { name: "LinkedIn", href: "#", src: "/icons/mail.png" },
  ];

  // Fetch product data
  const {
    data: productData,
    isLoading,
    error,
  } = api.product.list.getProductById.useQuery({ id });

  // Add to cart mutation
  const addToCartMutation = api.cart.form.addToCart.useMutation({
    onSuccess: () => {
      toast.success("Product added to cart successfully!");
      setIsAddingToCart(false);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to add product to cart");
      setIsAddingToCart(false);
    },
  });

  const handleAddToCart = async () => {
    if (!productData?.data) return;

    setIsAddingToCart(true);
    addToCartMutation.mutate({
      productId: id,
      quantity,
    });
  };

  const handleQuantityChange = (action: "increase" | "decrease") => {
    if (
      action === "increase" &&
      quantity < (productData?.data?.stockQuantity ?? 0)
    ) {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !productData?.success || !productData?.data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Product Not Found</CardTitle>
            <CardDescription>
              {error?.message ??
                productData?.error ??
                "The product you're looking for doesn't exist."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const product = productData.data;
  const price = parseFloat(product.price);
  const isInStock = product.stockQuantity && product.stockQuantity > 0;
  const maxQuantity = product.stockQuantity ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="text-muted-foreground flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/categories" className="hover:text-foreground">
              Categories
            </Link>
          </li>
          {product._category && (
            <>
              <li>/</li>
              <li>
                <Link
                  href={`/categories/${product._category.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="hover:text-foreground"
                >
                  {product._category.name}
                </Link>
              </li>
            </>
          )}
          <li>/</li>
          <li className="text-foreground font-medium">{product.name}</li>
        </ol>
      </nav>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <span className="text-lg text-gray-400">
                  No Image Available
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-16 space-y-6">
          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="mt-2">
              <span className="text-2xl font-semibold text-[#A18A68]">
                ${price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Product Details part 2 */}
          <div className="space-y-6">
            {/* Stars */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-black text-black" />
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            {isInStock && (
              <div className="flex flex-row items-center space-x-4">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange("decrease")}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    className="h-10 w-12 text-center text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange("increase")}
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Add to Cart */}
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !isInStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            )}

            {/* Icons Row */}
            <div className="mt-6 flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <span className="bg-border h-5 w-px" />
              {socialLinks.map((link) => (
                <Button key={link.name} variant="ghost" size="icon">
                  <Image
                    src={link.src}
                    alt={link.name}
                    width={16}
                    height={16}
                    className="h-4 w-4 object-contain"
                  />
                </Button>
              ))}
            </div>

            {/* SKU & Category */}
            <div className="mt-6 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">SKU:</span>{" "}
                {product.id.slice(-8).toUpperCase()}
              </p>
              {product._category && (
                <p>
                  <span className="text-muted-foreground">Categories:</span>{" "}
                  {product._category.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
