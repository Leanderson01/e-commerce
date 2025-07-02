"use client";

import React, { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import { ProductCard } from "./product-card";
import { Button } from "~/components/ui/button";

interface FilterState {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "name" | "price" | "created";
  sortOrder?: "asc" | "desc";
}

interface ProductGridProps {
  filters: FilterState;
}

const PRODUCTS_PER_PAGE = 12;

export function ProductGrid({ filters }: ProductGridProps) {
  const [page, setPage] = useState(0);

  // Use appropriate query based on whether category is selected
  const {
    data: productsData,
    isLoading,
    error,
  } = filters.categoryId
    ? api.product.list.getProductsByCategory.useQuery({
        categoryId: filters.categoryId,
        limit: PRODUCTS_PER_PAGE,
        offset: page * PRODUCTS_PER_PAGE,
        inStock: filters.inStock,
      })
    : api.product.list.getProducts.useQuery({
        limit: PRODUCTS_PER_PAGE,
        offset: page * PRODUCTS_PER_PAGE,
        inStock: filters.inStock,
      });

  // Reset page when filters change
  React.useEffect(() => {
    setPage(0);
  }, [filters.categoryId, filters.inStock, filters.minPrice, filters.maxPrice]);

  // Client-side filtering and sorting for price and sort options
  const filteredAndSortedProducts = useMemo(() => {
    if (!productsData?.products) return [];

    let products = [...productsData.products];

    // Filter by price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      products = products.filter((product) => {
        const price = product.price;
        const minCheck =
          filters.minPrice === undefined || Number(price) >= filters.minPrice;
        const maxCheck =
          filters.maxPrice === undefined || Number(price) <= filters.maxPrice;
        return minCheck && maxCheck;
      });
    }

    // Sort products
    if (filters.sortBy) {
      products.sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "price":
            comparison = Number(a.price) - Number(b.price);
            break;
          case "created":
            comparison =
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }

        return filters.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    return products;
  }, [
    productsData?.products,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
    filters.sortOrder,
  ]);

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          Failed to load products. Please try again.
        </p>
      </div>
    );
  }

  const hasNextPage = productsData?.pagination.total
    ? (page + 1) * PRODUCTS_PER_PAGE < productsData.pagination.total
    : false;

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : filteredAndSortedProducts.length > 0 ? (
          // Products
          filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          // No products found
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">
              No products found matching your criteria.
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Try adjusting your filters.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && filteredAndSortedProducts.length > 0 && (
        <div className="flex items-center justify-center space-x-2 pt-8">
          {/* Pagination dots */}
          <div className="flex space-x-2">
            {Array.from({
              length: Math.min(
                5,
                Math.ceil(
                  (productsData?.pagination.total ?? 0) / PRODUCTS_PER_PAGE,
                ),
              ),
            }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-2 w-2 rounded-full ${
                  i === page ? "bg-gray-800" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          <div className="ml-4 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-8 w-8 p-0"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
              className="h-8 w-8 p-0"
            >
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
