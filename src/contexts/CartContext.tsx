"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  _product: {
    id: string;
    name: string;
    price: string;
    imageUrl?: string | null;
  };
}

export interface Cart {
  id: string;
  userId: string;
  _items: CartItem[];
  total: number;
}

interface CartContextType {
  cart: Cart | null;
  isOpen: boolean;
  itemCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  // Get cart data
  const { data: cart, refetch: refetchCart } = api.cart.list.getCart.useQuery(
    {},
    {
      enabled: false, // We'll manually trigger this when needed
    },
  );

  // Add to cart mutation
  const addToCartMutation = api.cart.form.addToCart.useMutation({
    onSuccess: () => {
      refetchCart();
      toast.success("Product added to cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add product to cart");
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = api.cart.form.updateCartItem.useMutation({
    onSuccess: () => {
      refetchCart();
      toast.success("Cart updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update cart");
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = api.cart.form.removeFromCart.useMutation({
    onSuccess: () => {
      refetchCart();
      toast.success("Product removed from cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove product from cart");
    },
  });

  // Clear cart mutation
  const clearCartMutation = api.cart.form.clearCart.useMutation({
    onSuccess: () => {
      refetchCart();
      toast.success("Cart cleared");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to clear cart");
    },
  });

  // Update item count when cart changes
  useEffect(() => {
    if (cart?._items) {
      const count = cart._items.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      setItemCount(count);
    } else {
      setItemCount(0);
    }
  }, [cart]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    await addToCartMutation.mutateAsync({ productId, quantity });
  };

  const updateCartItem = async (cartItemId: string, quantity: number) => {
    await updateCartItemMutation.mutateAsync({ cartItemId, quantity });
  };

  const removeFromCart = async (cartItemId: string) => {
    await removeFromCartMutation.mutateAsync({ cartItemId });
  };

  const clearCart = async () => {
    await clearCartMutation.mutateAsync({});
  };

  const openCart = () => {
    refetchCart();
    setIsOpen(true);
  };

  const closeCart = () => {
    setIsOpen(false);
  };

  const value: CartContextType = {
    cart,
    isOpen,
    itemCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    openCart,
    closeCart,
    isLoading:
      addToCartMutation.isLoading ||
      updateCartItemMutation.isLoading ||
      removeFromCartMutation.isLoading ||
      clearCartMutation.isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
