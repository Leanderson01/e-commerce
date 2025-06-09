import { redirect } from "next/navigation";
import { Suspense } from "react";
import { api, HydrateClient } from "~/trpc/server";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await api.auth.user.getUserLogged.prefetch();

  const user = await api.auth.user.getUserLogged();

  if (!user) {
    void redirect("/auth/login");
  }

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </HydrateClient>
  );
}
