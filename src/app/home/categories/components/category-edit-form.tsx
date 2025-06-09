"use client";

import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { CategoryForm } from "./category-form";
import { useEffect } from "react";
import { categoryFormSchema, type CategoryFormValues } from "./category-form-values";
import type { ZodType } from "zod";

type CategoryEditFormProps = {
  categoryId: string;
};

export function CategoryEditForm({ categoryId }: CategoryEditFormProps) {
  const router = useRouter();
  const { data: category, isLoading, isError } = api.category.list.getCategoryById.useQuery({ id: categoryId });
  const updateMutation = api.category.form.updateCategory.useMutation({
    onSuccess: () => {
      toast.success("Category updated successfully");
      router.push("/home/categories");
    },
    onError: (error) => {
      toast.error("Error updating category", { description: error.message });
    },
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema as ZodType<CategoryFormValues>),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name ?? "",
        description: category.description ?? "",
      });
    }
  }, [category, form]);

  async function onSubmit(data: CategoryFormValues) {
    await updateMutation.mutateAsync({ id: categoryId, ...data });
  }

  if (isLoading) return <div>Loading...</div>;
  if (isError || !category) return <div>Category not found.</div>;

  return <CategoryForm form={form as unknown as UseFormReturn<CategoryFormValues>} onSubmit={onSubmit} mode="edit" />;
} 