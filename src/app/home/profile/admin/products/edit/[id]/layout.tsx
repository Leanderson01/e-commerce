import { api, HydrateClient } from "~/trpc/server";

export default function EditProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  void api.category.list.getCategories.prefetch({
    limit: 100,
    offset: 0,
  });

  return <HydrateClient>{children}</HydrateClient>;
}
