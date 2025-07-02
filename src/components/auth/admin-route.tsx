"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function AdminRoute({
  children,
  redirectTo = "/home",
  fallback,
}: AdminRouteProps) {
  const router = useRouter();
  const {
    data: user,
    isLoading,
    error,
  } = api.auth.user.getUserLogged.useQuery();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isLoading && (!user || error)) {
      router.push("/auth/login");
    } else if (!isLoading && user && !isAdmin) {
      router.push(redirectTo);
    }
  }, [user, isLoading, error, isAdmin, router, redirectTo]);

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

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-6 w-6" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page. Admin access is
              required.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push(redirectTo)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
