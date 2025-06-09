"use client";

import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function CategoriesPage() {
  const [allCategories, { isLoading }] = api.category.list.getCategories.useSuspenseQuery({
    limit: 10,
    offset: 0,
  });

  const deleteMutation = api.category.form.deleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Categoria deletada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao deletar categoria", { description: error.message });
    },
  });

  const [category, { isLoading: isCategoryLoading }] =
    api.category.list.getCategoryById.useSuspenseQuery({
      id: allCategories.categories[0]?.id ?? "",
    });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Categorias</h1>
      <div className="flex flex-col gap-4">
        {allCategories.categories.map((category) => (
          <div key={category.id}>{category.name}</div>
        ))}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold flex">Categoria</h1>
          <div className="flex gap-4 items-center justify-between">
          <div className="flex flex-col gap-4">
            <div>{category.name}</div>
            <div>{category.description}</div>
          </div>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate({ id: category.id });
              }}
            >
              Remover
            </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
