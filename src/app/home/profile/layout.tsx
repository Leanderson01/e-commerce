import { type Metadata } from "next";
import { Suspense } from "react";
import { ProtectedRoute } from "~/components/auth";
import { api, HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Profile | E-commerce",
  description: "Your profile page",
};

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await api.auth.user.getUserLogged.prefetch();

  return (
    <HydrateClient>
      <ProtectedRoute>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </ProtectedRoute>
    </HydrateClient>
  );
}
