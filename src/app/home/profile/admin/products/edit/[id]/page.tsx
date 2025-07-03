"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { ProductForm } from "~/app/home/profile/_components/product-form";
import { Loader2 } from "lucide-react";
import { fileToBase64 } from "~/lib/utils";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const utils = api.useUtils();

  // Get product data
  const { data: productResponse, isLoading: productLoading } =
    api.product.list.getProductById.useQuery({ id });

  const updateProduct = api.product.form.updateProduct.useMutation();
  const updateProductStock = api.product.form.updateProductStock.useMutation();
  const uploadImage = api.product.form.uploadProductImage.useMutation();

  // Extract product data
  const product = productResponse?.success ? productResponse.data : null;

  // Create form with reactive defaultValues (TanStack Form best practice)
  const form = useForm({
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      categoryId: product?.categoryId ?? "",
      price: product ? String(product.price) : "",
      stockQuantity: product ? String(product.stockQuantity ?? 1) : "1",
      image: undefined as File | undefined,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateProduct.mutateAsync({
          id,
          name: value.name ?? undefined,
          description: value.description ?? undefined,
          price: value.price ? Number(value.price) : undefined,
          categoryId: value.categoryId ?? undefined,
        });

        // Update stock separately
        await updateProductStock.mutateAsync({
          id,
          stockQuantity: Number(value.stockQuantity),
        });

        // Upload image if provided
        const imageFile = value.image;
        if (imageFile) {
          const imageData = await fileToBase64(imageFile);
          await uploadImage.mutateAsync({
            id,
            imageData,
            filename: imageFile.name.split(".")[0] ?? "product",
          });
        }

        toast.success("Product updated successfully!");
        void utils.product.list.invalidate();
        router.push("/home/profile?tab=manage-products");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update product");
      }
    },
  });

  if (productLoading) {
    return (
      <div className="mt-16 max-w-4xl px-24">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading product...</span>
        </div>
      </div>
    );
  }

  if (!productResponse?.success || !productResponse.data) {
    return (
      <div className="mt-16 max-w-4xl px-24">
        <div className="py-8 text-center">
          <p className="text-red-600 dark:text-red-400">
            {productResponse?.error ?? "Product not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 max-w-4xl px-24">
      <ProductForm
        form={form as unknown as ReturnType<typeof useForm>}
        isLoading={
          updateProduct.isPending ||
          updateProductStock.isPending ||
          uploadImage.isPending
        }
        isEdit
        existingImageUrl={productResponse.data.imageUrl ?? undefined}
      />
    </div>
  );
}
