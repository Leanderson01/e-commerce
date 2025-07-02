import { Suspense } from "react";
import { ProtectedRoute } from "~/components/auth";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </ProtectedRoute>
  );
}
