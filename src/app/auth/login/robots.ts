import { type Metadata, type MetadataRoute } from "next";

export const metadata: Metadata = {
  title: "Login | E-commerce",
  description:
    "Make login in your account to access all the features of the platform",
  keywords: ["login", "e-commerce", "account", "authentication", "access"],
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/dashboard/"],
    },
    sitemap: "https://e-commerce.com.br/sitemap.xml",
  };
}
