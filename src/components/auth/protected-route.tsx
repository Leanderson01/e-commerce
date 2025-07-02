"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { api } from "~/trpc/react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  redirectTo = "/auth/login",
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const {
    data: user,
    isLoading,
    error,
  } = api.auth.user.getUserLogged.useQuery();

  useEffect(() => {
    if (!isLoading && (!user || error)) {
      router.push(redirectTo);
    }
  }, [user, isLoading, error, router, redirectTo]);

  if (isLoading) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-r-transparent" />
        </div>
      )
    );
  }

  if (!user || error) {
    return null;
  }

  return <>{children}</>;
}
