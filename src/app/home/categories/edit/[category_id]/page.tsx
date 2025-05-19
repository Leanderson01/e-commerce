import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CategoryEditForm } from "../../components/category-edit-form";

export const metadata: Metadata = {
  title: "Edit Category",
};

export default function EditCategoryPage({ params }: { params: { category_id: string } }) {
  const id = params.category_id;
  if (!id) return notFound();
  return <CategoryEditForm categoryId={id} />;
} 