import { type Metadata, type MetadataRoute } from "next";

export const metadata: Metadata = {
  title: "Login | E-commerce",
  description:
    "Faça login na sua conta para acessar todas as funcionalidades da plataforma",
  keywords: ["login", "e-commerce", "conta", "autenticação", "acesso"],
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
