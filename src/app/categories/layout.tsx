import { api, HydrateClient } from "~/trpc/server";
import { Suspense } from "react";
import { MainLayout } from "~/components/layout";

export default async function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await api.category.list.getCategories.prefetch({
    limit: 50,
    offset: 0,
  });

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <MainLayout>{children}</MainLayout>
      </Suspense>
    </HydrateClient>
  );
}
