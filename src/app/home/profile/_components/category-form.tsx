"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { ImageDropzone } from "~/components/image-dropzone";
import { Loader2 } from "lucide-react";
import { type useForm } from "@tanstack/react-form";

interface CategoryFormProps {
  form: ReturnType<typeof useForm>;
  isLoading?: boolean;
  isEdit?: boolean;
  existingBannerUrl?: string;
}

export function CategoryForm({
  form,
  isLoading,
  isEdit,
  existingBannerUrl,
}: CategoryFormProps) {
  return (
    <div className="mb-28 space-y-28">
      {/* Header Section */}
      <div className="space-y-8">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
          {isEdit ? "Edit category" : "Add new category"}
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
        {/* Category Name */}
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) =>
              !value || (value as string).length < 1
                ? "Category name is required"
                : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="category-name"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Category name*
              </Label>
              <Input
                id="category-name"
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter category name"
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
        <form.Field name="description">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter category description"
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

        {/* Banner */}
        <form.Field name="banner">
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Banner
              </Label>
              <ImageDropzone
                multiple={false}
                onImagesChange={(files) => field.handleChange(files[0])}
                className="w-full"
                initialImageUrl={existingBannerUrl}
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
                "UPDATE CATEGORY"
              ) : (
                "ADD CATEGORY"
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
