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

interface TemporaryCartItem {
  productId: string;
  quantity: number;
  unitPrice: string;
  productName: string;
  productImageUrl?: string | null;
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

// Local storage key for temporary cart
const TEMP_CART_KEY = "temp_cart";

// Helper functions for temporary cart
const getTempCart = (): TemporaryCartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(TEMP_CART_KEY);
    return stored ? (JSON.parse(stored) as TemporaryCartItem[]) : [];
  } catch {
    return [];
  }
};

const setTempCart = (items: TemporaryCartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEMP_CART_KEY, JSON.stringify(items));
  } catch {
    // Ignore localStorage errors
  }
};

const clearTempCart = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TEMP_CART_KEY);
  } catch {
    // Ignore localStorage errors
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [tempCart, setTempCartState] = useState<TemporaryCartItem[]>([]);

  // Check if user is logged in
  const { data: currentUser } = api.auth.user.getCurrentUser.useQuery();

  // Get cart data (only if user is logged in)
  const { data: cart, refetch: refetchCart } = api.cart.list.getCart.useQuery(
    {},
    {
      enabled: !!currentUser, // Only fetch if user is logged in
    },
  );

  // Add to cart mutation
  const addToCartMutation = api.cart.form.addToCart.useMutation({
    onSuccess: () => {
      void refetchCart();
      toast.success("Product added to cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add product to cart");
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = api.cart.form.updateCartItem.useMutation({
    onSuccess: () => {
      void refetchCart();
      toast.success("Cart updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update cart");
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = api.cart.form.removeFromCart.useMutation({
    onSuccess: () => {
      void refetchCart();
      toast.success("Product removed from cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove product from cart");
    },
  });

  // Clear cart mutation
  const clearCartMutation = api.cart.form.clearCart.useMutation({
    onSuccess: () => {
      void refetchCart();
      toast.success("Cart cleared");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to clear cart");
    },
  });

  // Load temporary cart on mount
  useEffect(() => {
    if (!currentUser) {
      const tempItems = getTempCart();
      setTempCartState(tempItems);
    }
  }, [currentUser]);

  // Sync temporary cart when user logs in
  useEffect(() => {
    if (currentUser && tempCart.length > 0) {
      // Sync temp cart items to server
      const syncTempCart = async () => {
        try {
          for (const item of tempCart) {
            await addToCartMutation.mutateAsync({
              productId: item.productId,
              quantity: item.quantity,
            });
          }
          clearTempCart();
          setTempCartState([]);
          toast.success("Cart synced successfully!");
        } catch (error) {
          console.error(error);
          toast.error("Failed to sync cart");
        }
      };
      void syncTempCart();
    }
  }, [currentUser, tempCart, addToCartMutation]);

  // Update item count when cart changes
  useEffect(() => {
    if (currentUser && cart?._items) {
      const count = cart._items.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      setItemCount(count);
    } else if (!currentUser) {
      const count = tempCart.reduce((total, item) => total + item.quantity, 0);
      setItemCount(count);
    } else {
      setItemCount(0);
    }
  }, [cart, tempCart, currentUser]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (currentUser) {
      // User is logged in, use server cart
      await addToCartMutation.mutateAsync({ productId, quantity });
    } else {
      // User is not logged in, use temporary cart
      try {
        // Get product info for temporary cart
        const productResponse = await fetch(`/api/products/${productId}`);
        if (!productResponse.ok) {
          throw new Error("Failed to get product info");
        }
        const product = (await productResponse.json()) as {
          price: string;
          name: string;
          imageUrl: string | null;
        };

        const newTempItem: TemporaryCartItem = {
          productId,
          quantity,
          unitPrice: product.price,
          productName: product.name,
          productImageUrl: product.imageUrl,
        };

        const currentTempCart = getTempCart();
        const existingItemIndex = currentTempCart.findIndex(
          (item) => item.productId === productId,
        );

        if (existingItemIndex >= 0) {
          // Update existing item
          currentTempCart[existingItemIndex]!.quantity += quantity;
        } else {
          // Add new item
          currentTempCart.push(newTempItem);
        }

        setTempCart(currentTempCart);
        setTempCartState(currentTempCart);
        toast.success("Product added to cart");
      } catch (error) {
        console.error(error);
        toast.error("Failed to add product to cart");
      }
    }
  };

  const updateCartItem = async (cartItemId: string, quantity: number) => {
    if (currentUser) {
      await updateCartItemMutation.mutateAsync({ cartItemId, quantity });
    } else {
      // For temp cart, we'll use productId as cartItemId
      const currentTempCart = getTempCart();
      const itemIndex = currentTempCart.findIndex(
        (item) => item.productId === cartItemId,
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          currentTempCart.splice(itemIndex, 1);
        } else {
          currentTempCart[itemIndex]!.quantity = quantity;
        }
        setTempCart(currentTempCart);
        setTempCartState(currentTempCart);
        toast.success("Cart updated");
      }
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (currentUser) {
      await removeFromCartMutation.mutateAsync({ cartItemId });
    } else {
      // For temp cart, we'll use productId as cartItemId
      const currentTempCart = getTempCart();
      const itemIndex = currentTempCart.findIndex(
        (item) => item.productId === cartItemId,
      );

      if (itemIndex >= 0) {
        currentTempCart.splice(itemIndex, 1);
        setTempCart(currentTempCart);
        setTempCartState(currentTempCart);
        toast.success("Product removed from cart");
      }
    }
  };

  const clearCart = async () => {
    if (currentUser) {
      await clearCartMutation.mutateAsync({});
    } else {
      clearTempCart();
      setTempCartState([]);
      toast.success("Cart cleared");
    }
  };

  const openCart = () => {
    if (currentUser) {
      void refetchCart();
    }
    setIsOpen(true);
  };

  const closeCart = () => {
    setIsOpen(false);
  };

  // Get current cart data (server cart or temp cart)
  const getCurrentCart = () => {
    if (currentUser && cart) {
      return cart;
    } else if (!currentUser) {
      // Convert temp cart to Cart format for display
      const total = tempCart.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0,
      );
      return {
        id: "temp",
        userId: "temp",
        _items: tempCart.map((item, index) => ({
          id: `temp-${index}`,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          _product: {
            id: item.productId,
            name: item.productName,
            price: item.unitPrice,
            imageUrl: item.productImageUrl,
          },
        })),
        total,
      };
    }
    return null;
  };

  const value: CartContextType = {
    cart: getCurrentCart() as Cart | null,
    isOpen,
    itemCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    openCart,
    closeCart,
    isLoading:
      addToCartMutation.isPending ??
      updateCartItemMutation.isPending ??
      removeFromCartMutation.isPending ??
      clearCartMutation.isPending,
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
