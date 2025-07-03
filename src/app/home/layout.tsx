import { Suspense } from "react";
import { ProtectedRoute } from "~/components/auth";
import { MainLayout } from "~/components/layout";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <MainLayout>{children}</MainLayout>
      </Suspense>
    </ProtectedRoute>
  );
}
