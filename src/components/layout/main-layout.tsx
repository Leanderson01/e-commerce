"use client";

import React from "react";

import { Header } from "./header";
import { Footer } from "./footer";
import { LoadingProvider } from "~/components/providers/loading-provider";
import { ErrorBoundary } from "~/components/providers/error-boundary";

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <div className="flex min-h-screen flex-col">
          <Header />

          <main className="flex-1">
            <div className="">{children}</div>
          </main>

          {showFooter && <Footer />}
        </div>
      </LoadingProvider>
    </ErrorBoundary>
  );
}
