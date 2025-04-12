import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | E-commerce",
    default: "Login | E-commerce",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
