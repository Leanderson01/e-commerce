"use client";

import { api } from "~/trpc/react";
import { Loader2, BarChart3, Package, Users, DollarSign } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AccountDashboard() {
  const { data: user, isLoading } = api.auth.user.getUserLogged.useQuery();
  const router = useRouter();

  // Get some basic stats for admin
  const { data: ordersData } = api.order.list.getAllOrders.useQuery(
    { limit: 1, offset: 0 },
    { enabled: user?.role === "admin" },
  );

  const { data: productsData } = api.product.list.getProducts.useQuery(
    { limit: 1, offset: 0 },
    { enabled: user?.role === "admin" },
  );

  const handleExportReport = () => {
    toast.info("Export Report functionality coming soon!");
  };

  const handleManageProducts = () => {
    router.push("/home/profile?tab=manage-products");
  };

  const handleManageCategories = () => {
    router.push("/home/profile?tab=manage-categories");
  };

  const handleViewOrders = () => {
    router.push("/home/profile?tab=orders");
  };

  const handleAccountDetails = () => {
    router.push("/home/profile?tab=account-details");
  };

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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="mb-2 text-2xl font-bold">Welcome back, {firstName}!</h2>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Manage your e-commerce store from your admin dashboard."
            : "Track your orders and manage your account settings."}
        </p>
      </div>

      {/* Admin Dashboard */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <Package className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ordersData?.pagination?.total ?? 0}
                </div>
                <p className="text-muted-foreground text-xs">All time orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <BarChart3 className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {productsData?.pagination?.total ?? 0}
                </div>
                <p className="text-muted-foreground text-xs">Active products</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-muted-foreground text-xs">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={handleManageProducts}
                >
                  <Package className="mb-2 h-5 w-5" />
                  <span className="font-medium">Manage Products</span>
                  <span className="text-muted-foreground text-sm">
                    Add, edit, or remove products
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={handleManageCategories}
                >
                  <BarChart3 className="mb-2 h-5 w-5" />
                  <span className="font-medium">Manage Categories</span>
                  <span className="text-muted-foreground text-sm">
                    Organize your product catalog
                  </span>
                </Button>
              </div>

              <div className="border-t pt-4">
                <Button onClick={handleExportReport} className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Dashboard */}
      {!isAdmin && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                From your account dashboard you can view your recent orders,
                manage your billing addresses, and edit your password and
                account details.
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={handleViewOrders}
                >
                  <Package className="mb-2 h-5 w-5" />
                  <span className="font-medium">View Orders</span>
                  <span className="text-muted-foreground text-sm">
                    Check your order history
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={handleAccountDetails}
                >
                  <Users className="mb-2 h-5 w-5" />
                  <span className="font-medium">Account Details</span>
                  <span className="text-muted-foreground text-sm">
                    Update your profile information
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
