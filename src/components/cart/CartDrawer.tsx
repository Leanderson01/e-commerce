import { useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useCart } from "~/contexts/CartContext";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    cart,
    updateCartItem,
    removeFromCart,
    clearCart,
    isLoading,
  } = useCart();
  const router = useRouter();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Check if user is logged in
  const { data: currentUser } = api.auth.user.getCurrentUser.useQuery();

  const handleQuantityChange = async (
    cartItemId: string,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      await updateCartItem(cartItemId, newQuantity);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      await removeFromCart(cartItemId);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    if (!currentUser) {
      toast.error("Please log in to continue");
      closeCart();
      router.push("/auth/login");
      return;
    }

    closeCart();
    router.push("/checkout");
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(price));
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md" side="right">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col">
          {!cart || cart._items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <ShoppingCart className="text-muted-foreground h-12 w-12" />
              <h3 className="mt-4 text-lg font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Add some products to get started
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 py-4">
                  {cart._items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-lg border p-4"
                    >
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                        {item._product.imageUrl ? (
                          <img
                            src={item._product.imageUrl}
                            alt={item._product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="bg-muted flex h-full w-full items-center justify-center">
                            <ShoppingCart className="text-muted-foreground h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col">
                        <h4 className="font-medium">{item._product.name}</h4>
                        <p className="text-muted-foreground text-sm">
                          {formatPrice(item.unitPrice)}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={updatingItems.has(item.id) || isLoading}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              disabled={updatingItems.has(item.id) || isLoading}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={updatingItems.has(item.id) || isLoading}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-semibold">
                    {formatPrice(cart.total.toString())}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Proceed to Checkout
                  </Button>

                  <Button
                    variant="outline"
                    onClick={clearCart}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
