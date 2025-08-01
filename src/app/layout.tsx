import "~/styles/globals.css";

import { type Metadata } from "next";
import { DM_Sans } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";
import { CartProvider } from "~/contexts/CartContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "E-commerce",
  description: "E-commerce",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <CartProvider>
              {children}
              <Toaster position="top-right" />
            </CartProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
