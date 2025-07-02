import { AdminRoute } from "~/components/auth";

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminRoute>{children}</AdminRoute>;
}
