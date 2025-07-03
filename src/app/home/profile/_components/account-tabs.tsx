"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AccountDashboard } from "./account-dashboard";
import { AccountDetails } from "./account-details";
import { ComingSoon } from "./coming-soon";
import { LogoutButton } from "./logout-button";
import { api } from "~/trpc/react";
import { ManageCategories } from "./manage-categories";
import { ManageProducts } from "./manage-products";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useCallback } from "react";

export function AccountTabs() {
  const { data: user, isLoading } = api.auth.user.getUserLogged.useQuery();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get the tab from URL search params, default to "dashboard"
  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    return tabParam ?? "dashboard";
  }, [searchParams]);

  // Handle tab change
  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value === "dashboard") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }

      const queryString = params.toString();
      const newUrl = queryString
        ? `/home/profile?${queryString}`
        : "/home/profile";
      router.push(newUrl);
    },
    [searchParams, router],
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isAdmin = user?.role === "admin";

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <TabsList className="flex h-auto w-full items-center justify-start bg-transparent p-0">
          <TabsTrigger
            value="dashboard"
            className="h-12 rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:shadow-none dark:text-gray-400 dark:hover:text-gray-100 dark:data-[state=active]:border-gray-100 dark:data-[state=active]:text-gray-100"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="h-12 rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:shadow-none dark:text-gray-400 dark:hover:text-gray-100 dark:data-[state=active]:border-gray-100 dark:data-[state=active]:text-gray-100"
          >
            Orders
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger
                value="manage-categories"
                className="h-12 rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:shadow-none dark:text-gray-400 dark:hover:text-gray-100 dark:data-[state=active]:border-gray-100 dark:data-[state=active]:text-gray-100"
              >
                Manage Categories
              </TabsTrigger>
              <TabsTrigger
                value="manage-products"
                className="h-12 rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:shadow-none dark:text-gray-400 dark:hover:text-gray-100 dark:data-[state=active]:border-gray-100 dark:data-[state=active]:text-gray-100"
              >
                Manage Products
              </TabsTrigger>
            </>
          )}
          <TabsTrigger
            value="account-details"
            className="h-12 rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:shadow-none dark:text-gray-400 dark:hover:text-gray-100 dark:data-[state=active]:border-gray-100 dark:data-[state=active]:text-gray-100"
          >
            Account details
          </TabsTrigger>
          <TabsTrigger
            value="logout"
            className="h-12 rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:shadow-none dark:text-gray-400 dark:hover:text-gray-100 dark:data-[state=active]:border-gray-100 dark:data-[state=active]:text-gray-100"
          >
            Logout
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="mt-8">
        <TabsContent value="dashboard" className="mt-0 p-0">
          <AccountDashboard />
        </TabsContent>

        <TabsContent value="orders" className="mt-0 p-0">
          <ComingSoon title="Orders" />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="manage-categories" className="mt-0 p-0">
              <ManageCategories />
            </TabsContent>

            <TabsContent value="manage-products" className="mt-0 p-0">
              <ManageProducts />
            </TabsContent>
          </>
        )}

        <TabsContent value="account-details" className="mt-0 p-0">
          <AccountDetails />
        </TabsContent>

        <TabsContent value="logout" className="mt-0 p-0">
          <div className="mx-auto max-w-lg">
            <h2 className="mb-8 text-center text-xl font-normal text-gray-900 dark:text-white">
              Logout
            </h2>
            <LogoutButton />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
