"use client";

import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { ProductForm } from "~/app/home/profile/_components/product-form";
import { fileToBase64 } from "~/lib/utils";

export default function CreateProductPage() {
  const router = useRouter();
  const utils = api.useUtils();

  const createProduct = api.product.form.createProduct.useMutation({
    onSuccess: async (response) => {
      if (response?.id) {
        const productId = response.id;
        const imageFile = form.state.values.image;

        // Upload image if provided
        if (imageFile) {
          try {
            const imageData = await fileToBase64(imageFile);
            await uploadImage.mutateAsync({
              id: productId,
              imageData,
              filename: (imageFile as File).name.split(".")[0] ?? "product",
            });
          } catch (error) {
            console.error("Failed to upload product image:", error);
            toast.warning("Product created but image upload failed");
          }
        }

        toast.success("Product created successfully!");
        form.reset();
        void utils.product.list.invalidate();
        router.push("/home/profile?tab=manage-products");
      } else {
        toast.error("Failed to create product");
      }
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create product");
    },
  });

  const uploadImage = api.product.form.uploadProductImage.useMutation();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      price: "",
      stockQuantity: "0",
      image: undefined,
    },
    onSubmit: async ({ value }) => {
      createProduct.mutate({
        name: value.name,
        description: value.description ?? undefined,
        price: Number(value.price),
        stockQuantity: Number(value.stockQuantity),
        categoryId: value.categoryId ?? undefined,
      });
    },
  });

  return (
    <div className="mt-16 max-w-4xl px-24">
      <ProductForm
        form={form as unknown as ReturnType<typeof useForm>}
        isLoading={createProduct.isPending || uploadImage.isPending}
      />
    </div>
  );
}
