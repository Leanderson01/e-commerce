import type { Metadata } from "next";
import { CategoryCreateForm } from "../components/category-create-form";

export const metadata: Metadata = {
  title: "Create Category",
};

export default function NewCategoryPage() {
  return <CategoryCreateForm />;
}
