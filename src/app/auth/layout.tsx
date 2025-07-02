import type { Metadata } from "next";
import { MainLayout } from "~/components/layout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "E-commerce - Auth",
  description: "E-commerce - Auth",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        {children}
      </div>
    </MainLayout>
  );
}
