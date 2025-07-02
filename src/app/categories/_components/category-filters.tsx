"use client";

import { api } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";

interface CategoryFiltersProps {
  selectedCategory?: string;
  onCategoryChange: (categoryId?: string) => void;
}

export function CategoryFilters({
  selectedCategory,
  onCategoryChange,
}: CategoryFiltersProps) {
  const { data: categories, isLoading } =
    api.category.list.getCategories.useQuery({
      limit: 50,
      offset: 0,
    });

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (!categories?.categories.length) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No categories available" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={selectedCategory ?? "all"}
      onValueChange={(value: string) =>
        onCategoryChange(value === "all" ? undefined : value)
      }
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Sort By" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
