"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useCart } from "~/contexts/CartContext";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  // Check if user is logged in
  const { data: currentUser, isLoading: userLoading } =
    api.auth.user.getCurrentUser.useQuery();

  // Create order mutation
  const createOrderMutation = api.order.form.createOrder.useMutation({
    onSuccess: () => {
      toast.success("Order placed successfully!");
      clearCart();
      router.push("/home/orders");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to place order");
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !currentUser) {
      toast.error("Please log in to continue");
      router.push("/auth/login");
    }
  }, [currentUser, userLoading, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart && cart._items.length === 0) {
      toast.error("Your cart is empty");
      router.push("/categories");
    }
  }, [cart, router]);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(price));
  };

  const handleCheckout = async () => {
    if (!cart || cart._items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    await createOrderMutation.mutateAsync({});
  };

  // Loading state
  if (userLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  // Cart is empty
  if (!cart || cart._items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground mt-2">
          Review your order and complete your purchase
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Items
              </CardTitle>
              <CardDescription>Review the items in your cart</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart._items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                              {item._product.imageUrl ? (
                                <img
                                  src={item._product.imageUrl}
                                  alt={item._product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="bg-muted flex h-full w-full items-center justify-center">
                                  <ShoppingCart className="text-muted-foreground h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {item._product.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(
                            (Number(item.unitPrice) * item.quantity).toString(),
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.total.toString())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(cart.total.toString())}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={createOrderMutation.isPending}
                className="w-full"
                size="lg"
              >
                {createOrderMutation.isPending
                  ? "Processing..."
                  : "Place Order"}
              </Button>

              <p className="text-muted-foreground text-center text-xs">
                By placing your order, you agree to our terms and conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
