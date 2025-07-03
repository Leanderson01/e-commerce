"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ImageDropzone } from "~/components/image-dropzone";
import { Loader2, Minus, Plus } from "lucide-react";
import { type useForm } from "@tanstack/react-form";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";

interface ProductFormProps {
  form: ReturnType<typeof useForm>;
  isLoading?: boolean;
  isEdit?: boolean;
  existingImageUrl?: string;
}

export function ProductForm({
  form,
  isLoading,
  isEdit,
  existingImageUrl,
}: ProductFormProps) {
  // Get categories for the select
  const { data: categories, isLoading: categoriesLoading } =
    api.category.list.getCategories.useQuery({
      limit: 50,
      offset: 0,
    });

  return (
    <div className="mb-28 space-y-28">
      {/* Header Section */}
      <div className="space-y-8">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
          {isEdit ? "Edit product" : "Add new product"}
        </h1>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />
      </div>

      {/* Form Section */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();

          void form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Product Name */}
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) =>
              !value || (value as string).length < 1
                ? "Product name is required"
                : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="product-name"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Product name*
              </Label>
              <Input
                id="product-name"
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter product name"
                className="h-12"
              />
              {field.state.meta.errors && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Description */}
        <form.Field
          name="description"
          validators={{
            onChange: ({ value }) =>
              !value || (value as string).length < 1
                ? "Description is required"
                : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description*
              </Label>
              <Textarea
                id="description"
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter product description"
                className="min-h-[100px] resize-none"
              />
              {field.state.meta.errors && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Category */}
        <form.Field
          name="categoryId"
          validators={{
            onChange: ({ value }) => {
              if (categoriesLoading) return undefined;

              const val = value as string;
              if (!val || val.length < 1) return "Category is required";

              if (
                val &&
                !categories?.data?.categories.some((cat) => cat.id === val)
              ) {
                return "Please select a valid category";
              }

              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category*
              </Label>
              {categoriesLoading ? (
                <Skeleton className="w-full" />
              ) : !categories?.data?.categories.length ? (
                <Select disabled>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No categories available" />
                  </SelectTrigger>
                </Select>
              ) : (
                <Select
                  value={field.state.value as string}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.data.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {field.state.meta.errors && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Price */}
        <form.Field
          name="price"
          validators={{
            onChange: ({ value }) => {
              if (!value) return "Price is required";
              const numValue = Number(value);
              if (isNaN(numValue) || numValue <= 0) {
                return "Price must be a positive number";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="price"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Price*
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="0.00"
                className="h-12"
              />
              {field.state.meta.errors && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Stock */}
        <form.Field
          name="stockQuantity"
          validators={{
            onChange: ({ value }) => {
              const numValue = Number(value);
              if (isNaN(numValue) || numValue < 1) {
                return "Stock must be at least 1";
              }
              return undefined;
            },
          }}
        >
          {(field) => {
            const value = Number(field.state.value) || 1;

            const handleQuantityChange = (action: "increase" | "decrease") => {
              if (action === "increase" && value < 100) {
                field.handleChange(String(value + 1));
              } else if (action === "decrease" && value > 1) {
                field.handleChange(String(value - 1));
              }
            };

            const handleInputChange = (
              e: React.ChangeEvent<HTMLInputElement>,
            ) => {
              let val = parseInt(e.target.value, 10);
              if (Number.isNaN(val)) val = 1;
              if (val < 1) val = 1;
              if (val > 100) val = 100;
              field.handleChange(String(val));
            };

            const selectAll = (e: React.SyntheticEvent<HTMLInputElement>) => {
              e.currentTarget.select();
            };

            return (
              <div className="w-fit space-y-2">
                <Label
                  htmlFor="stock"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Stock*
                </Label>
                <div className="flex items-center rounded bg-[#EFEFEF] px-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("decrease")}
                    disabled={value <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input
                    type="number"
                    value={field.state.value as string}
                    onChange={handleInputChange}
                    onFocus={selectAll}
                    onClick={selectAll}
                    onBlur={field.handleBlur}
                    min={1}
                    max={100}
                    className="h-10 w-12 appearance-none bg-transparent text-center text-sm focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("increase")}
                    disabled={value >= 100}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {field.state.meta.errors && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            );
          }}
        </form.Field>

        {/* Product Image */}
        <form.Field
          name="image"
          validators={{
            onChange: ({ value }) =>
              !value && !existingImageUrl
                ? "Product image is required"
                : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Image*
              </Label>
              <ImageDropzone
                multiple={false}
                onImagesChange={(files) => field.handleChange(files[0])}
                className="w-full"
                initialImageUrl={existingImageUrl}
              />
              {field.state.meta.errors && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Submit Button */}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="h-12 w-60 bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : isEdit ? (
                "UPDATE PRODUCT"
              ) : (
                "ADD PRODUCT"
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
