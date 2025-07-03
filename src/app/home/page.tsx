"use client";

import { Button } from "~/components/ui/button";
import { ProductCard } from "../categories/_components/product-card";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const { data: productsResponse, isLoading } =
    api.product.list.getProducts.useQuery({
      limit: 100,
      offset: 0,
      inStock: false,
    });

  return (
    <div className="mx-auto mb-60 flex flex-col gap-8 px-24 py-8">
      {/* Banner Section */}
      <Image
        src="/home-banner.png"
        alt="Banner"
        width={1248}
        height={637}
        className="w-full rounded-lg object-cover"
      />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shop The Latest</h1>
        <Link href="/categories">
          <Button variant="link" className="text-sm text-[#A18A68]">
            View All
          </Button>
        </Link>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-[472px]">
                <Skeleton className="h-full w-full" />
              </div>
            ))
          : productsResponse?.products.map((product) => (
              <div key={product.id} className="h-[472px]">
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </div>
  );
}
