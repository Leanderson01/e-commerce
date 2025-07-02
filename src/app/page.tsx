import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function LandingPage() {
  return (
    <div className="from-primary/20 via-background to-secondary/20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br">
      <div className="container flex flex-col items-center justify-start gap-12 px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Welcome to <span className="text-primary">E-commerce</span>
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg">
            Discover amazing products at unbeatable prices. Shop with confidence
            and enjoy fast, secure delivery.
          </p>
        </div>

        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/home">Shop Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>

        <div className="grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
              <span className="text-2xl">🚚</span>
            </div>
            <h3 className="text-lg font-semibold">Fast Delivery</h3>
            <p className="text-muted-foreground text-sm">
              Quick and reliable shipping to your door
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold">Secure Payment</h3>
            <p className="text-muted-foreground text-sm">
              Your transactions are safe and protected
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="text-lg font-semibold">Quality Products</h3>
            <p className="text-muted-foreground text-sm">
              Curated selection of premium items
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
