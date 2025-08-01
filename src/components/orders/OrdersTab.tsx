import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Calendar, DollarSign, Eye } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";

export function OrdersTab() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Get current user to check if admin
  const { data: currentUser } = api.auth.user.getCurrentUser.useQuery();

  // Get orders (user orders or all orders for admin)
  const { data: ordersData, isLoading } = api.order.list.getUserOrders.useQuery(
    {
      limit,
      offset: (currentPage - 1) * limit,
    },
    {
      enabled: !!currentUser,
    },
  );

  // Get all orders for admin
  const { data: allOrdersData } = api.order.list.getAllOrders.useQuery(
    {
      limit,
      offset: (currentPage - 1) * limit,
    },
    {
      enabled: !!currentUser && currentUser.role === "admin",
    },
  );

  const orders =
    currentUser?.role === "admin" ? allOrdersData?.orders : ordersData?.orders;
  const pagination =
    currentUser?.role === "admin"
      ? allOrdersData?.pagination
      : ordersData?.pagination;

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(price));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="py-8 text-center">
        <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No orders found</h3>
        <p className="text-muted-foreground mb-4">
          {currentUser?.role === "admin"
            ? "No orders have been placed yet."
            : "You haven't placed any orders yet."}
        </p>
        <Button onClick={() => router.push("/categories")}>
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-muted-foreground">
            {currentUser?.role === "admin"
              ? "All customer orders"
              : "Your order history"}
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="text-muted-foreground h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(order.orderDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatPrice(order.totalAmount)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/home/orders/${order.id}`)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items:</span>
                  <span>{order._items?.length || 0} products</span>
                </div>
                {currentUser?.role === "admin" && order._user && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Customer:</span>
                    <span>
                      {order._user.profile?.fullName || order._user.email}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {(currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, pagination.total)} of{" "}
            {pagination.total} orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * limit >= pagination.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
