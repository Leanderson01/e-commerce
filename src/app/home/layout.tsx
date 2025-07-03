import { Suspense } from "react";
import { MainLayout } from "~/components/layout";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainLayout>{children}</MainLayout>
    </Suspense>
  );
}
