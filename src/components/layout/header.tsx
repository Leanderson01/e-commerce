"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  User,
  LogOut,
  Settings,
  Package,
  BarChart3,
  Search,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

const navigationItems = [
  { name: "All", href: "/categories" },
  { name: "Watch", href: "/categories/watch" },
  { name: "Mac", href: "/categories/mac" },
  { name: "iPad", href: "/categories/ipad" },
  { name: "iPhone", href: "/categories/iphone" },
];

const userMenuItems = [
  { name: "Profile", href: "/home/profile", icon: User as React.ElementType },
  { name: "Orders", href: "/home/orders", icon: Package as React.ElementType },
  {
    name: "Settings",
    href: "/home/profile?tab=account-details",
    icon: Settings as React.ElementType,
  },
];

const adminMenuItems = [
  {
    name: "Admin Dashboard",
    href: "/home/profile?tab=dashboard",
    icon: BarChart3 as React.ElementType,
  },
  {
    name: "Manage Products",
    href: "/home/profile?tab=manage-products",
    icon: Package as React.ElementType,
  },
  {
    name: "Manage Categories",
    href: "/home/profile?tab=manage-categories",
    icon: Settings as React.ElementType,
  },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Get user data (optional - won't throw error if not logged in)
  const { data: user, isLoading: userLoading } =
    api.auth.user.getCurrentUser.useQuery(undefined, {
      retry: false,
      refetchOnWindowFocus: false,
    });

  // Get cart data
  const { data: cart } = api.cart.list.getCart.useQuery(
    {},
    {
      enabled: !!user,
      retry: false,
    },
  );

  // Logout mutation
  const logoutMutation = api.auth.form.logout.useMutation({
    onSuccess: () => {
      router.push("/auth/login");
      router.refresh();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const cartItemsCount = cart?._items?.length ?? 0;
  const isAdmin = user?.role === "admin";

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 mt-12 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between px-24">
        {/* Logo */}
        <Link href="/home" className="flex items-center space-x-2">
          <p className="text-[40px] font-bold">
            <span className="font-normal text-[#A18A68]">i</span>SHOP
          </p>
        </Link>

        {/* Navigation + Actions Container */}
        <div className="flex items-center">
          {/* Navigation */}
          <nav className="hidden items-center space-x-8 md:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="hover:text-primary text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Vertical Divider */}
          <div className="bg-border mx-6 hidden h-6 w-px md:block" />

          {/* Actions */}
          <div className="flex items-center">
            {/* Search */}
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative ml-2 h-10 w-10"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu or Login */}
            {userLoading ? (
              <div className="bg-muted ml-2 h-8 w-8 animate-pulse rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-10 w-10"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span>{user.profile?.fullName ?? "User"}</span>
                    <span className="text-muted-foreground text-xs font-normal">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* User Menu Items */}
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  {/* Admin Menu Items */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-muted-foreground text-xs">
                        Admin
                      </DropdownMenuLabel>
                      {adminMenuItems.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link href={item.href} className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" className="ml-2">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-10 w-10 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Navigate through our e-commerce
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 flex flex-col space-y-4">
                  {/* Navigation Items */}
                  <div className="space-y-2">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="hover:bg-muted block rounded-md px-4 py-2 text-lg font-medium transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {user && (
                    <>
                      <div className="space-y-2 border-t pt-4">
                        <div className="px-4 py-2">
                          <p className="font-medium">
                            {user.profile?.fullName ?? "User"}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {user.email}
                          </p>
                        </div>

                        {userMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="hover:bg-muted flex items-center rounded-md px-4 py-2 text-lg font-medium transition-colors"
                          >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                          </Link>
                        ))}

                        {isAdmin && (
                          <>
                            <div className="border-t pt-2">
                              <p className="text-muted-foreground px-4 py-2 text-sm font-medium">
                                Admin
                              </p>
                              {adminMenuItems.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="hover:bg-muted flex items-center rounded-md px-4 py-2 text-lg font-medium transition-colors"
                                >
                                  <item.icon className="mr-3 h-5 w-5" />
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          disabled={logoutMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-start"
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          {logoutMutation.isPending
                            ? "Signing out..."
                            : "Sign Out"}
                        </Button>
                      </div>
                    </>
                  )}

                  {!user && (
                    <div className="border-t pt-4">
                      <Button asChild className="w-full">
                        <Link
                          href="/auth/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
