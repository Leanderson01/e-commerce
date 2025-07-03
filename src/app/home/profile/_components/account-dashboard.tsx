"use client";

import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";

export function AccountDashboard() {
  const { data: user, isLoading } = api.auth.user.getUserLogged.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const firstName = user?.profile?.firstName;

  return (
    <div className="space-y-4">
      <p className="text-gray-800 dark:text-gray-200">
        Hello {firstName}! (not {firstName}?{" "}
        <a
          href="#"
          className="text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          Log out
        </a>
        )
      </p>

      {isAdmin ? (
        <p className="text-gray-800 dark:text-gray-200">
          From your admin dashboard you can{" "}
          <a
            href="#"
            className="text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            manage categories
          </a>
          ,{" "}
          <a
            href="#"
            className="text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            manage products
          </a>
          , view all{" "}
          <a
            href="#"
            className="text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            orders
          </a>
          , and edit your{" "}
          <a
            href="#"
            className="text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            account details
          </a>
          .
        </p>
      ) : (
        <p className="text-gray-800 dark:text-gray-200">
          From your account dashboard you can view your{" "}
          <a
            href="#"
            className="text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            recent orders
          </a>
          , manage your{" "}
          <a
            href="#"
            className="text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            billing addresses
          </a>
          , and edit your{" "}
          <a
            href="#"
            className="text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            password and account details
          </a>
          .
        </p>
      )}
    </div>
  );
}
