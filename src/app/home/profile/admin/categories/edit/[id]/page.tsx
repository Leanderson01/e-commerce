"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { CategoryForm } from "~/app/home/profile/_components/category-form";
import { Loader2 } from "lucide-react";

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const utils = api.useUtils();

  // Get category data
  const { data: categoryResponse, isLoading: categoryLoading } =
    api.category.list.getCategoryById.useQuery({ id });

  const updateCategory = api.category.form.updateCategory.useMutation({
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Category updated successfully!");
        void utils.category.list.invalidate();
        router.push("/home/profile?tab=manage-categories");
      } else {
        toast.error(response.error?.message ?? "Failed to update category");
      }
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update category");
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      banner: undefined as File | undefined,
    },
    onSubmit: async ({ value }) => {
      updateCategory.mutate({
        id,
        name: value.name,
        description: value.description || undefined,
        banner: value.banner,
      });
    },
  });

  // Update form values when category data loads
  useEffect(() => {
    if (categoryResponse?.success && categoryResponse.data) {
      const { name, description } = categoryResponse.data;
      form.setFieldValue("name", name);
      form.setFieldValue("description", description ?? "");
    }
  }, [categoryResponse, form]);

  if (categoryLoading) {
    return (
      <div className="mt-16 max-w-4xl px-24">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading category...</span>
        </div>
      </div>
    );
  }

  if (!categoryResponse?.success) {
    return (
      <div className="mt-16 max-w-4xl px-24">
        <div className="py-8 text-center">
          <p className="text-red-600 dark:text-red-400">
            {categoryResponse?.error?.message ?? "Category not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 max-w-4xl px-24">
      <CategoryForm
        form={form as unknown as ReturnType<typeof useForm>}
        isLoading={updateCategory.isPending}
        isEdit={true}
      />
    </div>
  );
}
