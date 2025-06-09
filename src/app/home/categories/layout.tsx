import { api } from "~/trpc/server";

export default async function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await api.auth.user.getUserLogged();

  return <div>{children}</div>;
}
