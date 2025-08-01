import { ShoppingCart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useCart } from "~/contexts/CartContext";

export function CartIcon() {
  const { itemCount, openCart } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={openCart}
      className="relative"
      aria-label="Open cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Button>
  );
}
