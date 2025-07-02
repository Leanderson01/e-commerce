"use client";

import { useState } from "react";
import { Slider } from "~/components/ui/slider";

interface PriceFiltersProps {
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (min?: number, max?: number) => void;
}

export function PriceFilters({
  minPrice = 0,
  maxPrice = 5000,
  onPriceChange,
}: PriceFiltersProps) {
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);

  // Range limits - these could be fetched from backend in the future
  const PRICE_MIN = 0;
  const PRICE_MAX = 5000;

  const handleRangeChange = (values: number[]) => {
    const [newMin, newMax] = values;
    setPriceRange([newMin ?? PRICE_MIN, newMax ?? PRICE_MAX]);
    onPriceChange(
      newMin === PRICE_MIN ? undefined : newMin,
      newMax === PRICE_MAX ? undefined : newMax,
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Header with Price and Filters */}

        <div className="space-y-4">
          {/* Price Range Slider */}
          <div className="space-y-2">
            <Slider
              value={priceRange}
              onValueChange={handleRangeChange}
              max={PRICE_MAX}
              min={PRICE_MIN}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Price: ${priceRange[0]} - ${priceRange[1]}
              </div>
              <div className="text-sm font-light text-[#A18A68]">Filter</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
