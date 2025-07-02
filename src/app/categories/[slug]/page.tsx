"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { CategoryFilters } from "../_components/category-filters";
import { PriceFilters } from "../_components/price-filters";
import { StockFilters } from "../_components/stock-filters";
import { ProductGrid } from "../_components/product-grid";
import { Skeleton } from "~/components/ui/skeleton";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = React.use(params);

  // Estados dos filtros
  const [filters, setFilters] = useState<{
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: "name" | "price" | "created";
    sortOrder?: "asc" | "desc";
  }>({});

  // Buscar categoria por slug
  const { data: categoryData, isLoading: categoryLoading } =
    api.category.list.getCategoryBySlug.useQuery({
      slug,
    });

  useEffect(() => {
    if (categoryData && !filters.categoryId) {
      setFilters((prev) => ({ ...prev, categoryId: categoryData?.data?.id }));
    }
  }, [filters.categoryId, categoryData]);

  // Loading state
  if (categoryLoading) {
    return (
      <div className="mx-auto max-w-7xl px-24 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="flex gap-8">
          <div className="w-64 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-24 py-8">
      {/* Header da categoria */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{categoryData?.data?.name}</h1>
        {categoryData?.data?.description && (
          <p className="mt-2 text-gray-600">{categoryData.data.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {categoryData?.data?.productCount} produtos encontrados
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar com filtros */}
        <div className="w-64 space-y-6">
          <CategoryFilters
            selectedCategory={filters.categoryId}
            onCategoryChange={(categoryId) =>
              setFilters((prev) => ({ ...prev, categoryId }))
            }
          />

          <PriceFilters
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onPriceChange={(min, max) =>
              setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }))
            }
          />

          <StockFilters
            inStock={filters.inStock}
            onStockChange={(inStock) =>
              setFilters((prev) => ({ ...prev, inStock }))
            }
          />
        </div>

        {/* Grid de produtos */}
        <div className="flex-1">
          <ProductGrid filters={filters} />
        </div>
      </div>
    </div>
  );
}
