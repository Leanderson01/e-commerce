import { notFound } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { Suspense } from "react";
import { MainLayout } from "~/components/layout";

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}) {
  const id = (await params).id;
  const product = await api.product.list.getProductById({ id });

  if (!product.success || !product.data) {
    notFound();
  }

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <MainLayout>{children}</MainLayout>
      </Suspense>
    </HydrateClient>
  );
}
