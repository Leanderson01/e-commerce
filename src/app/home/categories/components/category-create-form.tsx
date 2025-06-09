"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { CategoryForm } from "./category-form";
import { categoryFormSchema, type CategoryFormValues } from "./category-form-values";
import type { ZodType } from "node_modules/zod/lib/types";

export function CategoryCreateForm() {
  const router = useRouter();
  const createMutation = api.category.form.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Category created successfully");
      router.push("/home/categories");
    },
    onError: (error) => {
      toast.error("Error creating category", { description: error.message });
    },
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema as ZodType<CategoryFormValues>),
    defaultValues: { name: "", description: "" },
  });

  async function onSubmit(data: CategoryFormValues) {
    await createMutation.mutateAsync({ ...data });
  }

  return <CategoryForm form={form} onSubmit={onSubmit} mode="create" />;
} 