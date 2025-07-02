"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface SortOptionsProps {
  sortBy?: "name" | "price" | "created";
  sortOrder?: "asc" | "desc";
  onSortChange: (
    sortBy: "name" | "price" | "created",
    sortOrder: "asc" | "desc",
  ) => void;
}

export function SortOptions({
  sortBy = "name",
  sortOrder = "asc",
  onSortChange,
}: SortOptionsProps) {
  const currentValue = `${sortBy}-${sortOrder}`;

  const handleValueChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-") as [
      "name" | "price" | "created",
      "asc" | "desc",
    ];
    onSortChange(newSortBy, newSortOrder);
  };

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="name-asc">Name (A to Z)</SelectItem>
        <SelectItem value="name-desc">Name (Z to A)</SelectItem>
        <SelectItem value="price-asc">Price (Low to High)</SelectItem>
        <SelectItem value="price-desc">Price (High to Low)</SelectItem>
        <SelectItem value="created-desc">Newest First</SelectItem>
        <SelectItem value="created-asc">Oldest First</SelectItem>
      </SelectContent>
    </Select>
  );
}
