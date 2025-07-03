"use client";

import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { CategoryForm } from "~/app/home/profile/_components/category-form";

export default function CreateCategoryPage() {
  const router = useRouter();
  const utils = api.useUtils();

  const createCategory = api.category.form.createCategory.useMutation({
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Category created successfully!");
        form.reset();
        void utils.category.list.invalidate();
        router.push("/home/profile?tab=manage-categories");
      } else {
        toast.error(response.error?.message ?? "Failed to create category");
      }
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create category");
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      banner: undefined as File | undefined,
    },
    onSubmit: async ({ value }) => {
      createCategory.mutate({
        name: value.name,
        description: value.description || undefined,
        banner: value.banner,
      });
    },
  });

  return (
    <div className="mt-16 max-w-4xl px-24">
      <CategoryForm
        form={form as unknown as ReturnType<typeof useForm>}
        isLoading={createCategory.isPending}
      />
    </div>
  );
}
