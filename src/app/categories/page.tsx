"use client";

import { useState } from "react";
import { ProductGrid } from "./_components/product-grid";
import { CategoryFilters } from "./_components/category-filters";
import { PriceFilters } from "./_components/price-filters";
import { StockFilters } from "./_components/stock-filters";

interface FilterState {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "name" | "price" | "created";
  sortOrder?: "asc" | "desc";
}

export default function CategoriesPage() {
  const [filters, setFilters] = useState<FilterState>({
    inStock: true,
    sortBy: "name",
    sortOrder: "asc",
  });

  const updateFilter = (
    key: keyof FilterState,
    value: FilterState[keyof FilterState],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto px-24 py-8">
      {/* Main Content */}
      <div className="flex gap-8">
        {/* Left Sidebar - Filters */}
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                Shop The Latest
              </h1>
            </div>

            {/* Sort By - Category Select */}
            <CategoryFilters
              selectedCategory={filters.categoryId}
              onCategoryChange={(categoryId: string | undefined) =>
                updateFilter("categoryId", categoryId)
              }
            />

            {/* Price Range */}
            <PriceFilters
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              onPriceChange={(
                min: number | undefined,
                max: number | undefined,
              ) => {
                updateFilter("minPrice", min);
                updateFilter("maxPrice", max);
              }}
            />

            {/* In Stock Only Switch */}
            <StockFilters
              inStock={filters.inStock}
              onStockChange={(inStock: boolean | undefined) =>
                updateFilter("inStock", inStock)
              }
            />
          </div>
        </div>

        {/* Right Side - Products */}
        <div className="flex-1">
          <ProductGrid filters={filters} />
        </div>
      </div>
    </div>
  );
}
