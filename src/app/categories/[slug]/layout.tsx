import { notFound } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { Suspense } from "react";

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}) {
  const slug = (await params).slug;
  const category = await api.category.list.getCategoryBySlug({ slug });
  await api.category.list.getCategories.prefetch({
    limit: 50,
    offset: 0,
  });

  if (!category.data) {
    notFound();
  }

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <div>{children}</div>
      </Suspense>
    </HydrateClient>
  );
}
