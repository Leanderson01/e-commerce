"use client";

import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";

interface StockFiltersProps {
  inStock?: boolean;
  onStockChange: (inStock?: boolean) => void;
}

export function StockFilters({ inStock, onStockChange }: StockFiltersProps) {
  return (
    <div className="flex items-center justify-between space-x-2">
      <Label
        htmlFor="in-stock"
        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        In stock only
      </Label>
      <Switch
        id="in-stock"
        checked={inStock === true}
        onCheckedChange={(checked) => onStockChange(checked ? true : undefined)}
      />
    </div>
  );
}
