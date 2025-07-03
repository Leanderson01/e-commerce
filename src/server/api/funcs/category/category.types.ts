import { z } from "zod";
import type { Product } from "~/server/db/src/schema/product";

// Schema para listar todas as categorias
export const getCategoriesSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Schema para obter detalhes de uma categoria
export const getCategoryByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema para obter categoria por slug
export const getCategoryBySlugSchema = z.object({
  slug: z.string().min(1),
});

// Schema para criar uma nova categoria
export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

// Schema para atualizar uma categoria
export const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Category name is required").optional(),
  description: z.string().optional(),
});

// Schema para excluir uma categoria
export const deleteCategorySchema = z.object({
  id: z.string().uuid(),
});

// Schema para upload de banner de categoria
export const uploadCategoryBannerSchema = z.object({
  id: z.string().uuid(),
  imageData: z.string(), // base64
  filename: z.string(),
});

// Tipos inferidos dos schemas
export type GetCategoriesInput = z.infer<typeof getCategoriesSchema>;
export type GetCategoryByIdInput = z.infer<typeof getCategoryByIdSchema>;
export type GetCategoryBySlugInput = z.infer<typeof getCategoryBySlugSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type UploadCategoryBannerInput = z.infer<
  typeof uploadCategoryBannerSchema
>;

// Tipos de resposta com pattern success/error
export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: {
        code: string;
        message: string;
      };
    };

// Tipos específicos de resposta para cada operação
export type GetCategoryBySlugResponse = ApiResponse<{
  id: string;
  name: string;
  description: string | null;
  bannerUrl: string;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
  _products: Product[];
} | null>;

export type GetCategoryByIdResponse = ApiResponse<{
  id: string;
  name: string;
  description: string | null;
  bannerUrl: string;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
  _products: Product[];
}>;

export type GetCategoriesResponse = ApiResponse<{
  categories: Array<{
    id: string;
    name: string;
    description: string | null;
    bannerUrl: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}>;

export type CreateCategoryResponse = ApiResponse<{
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export type UpdateCategoryResponse = ApiResponse<{
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export type DeleteCategoryResponse = ApiResponse<{
  success: boolean;
}>;

export type UploadCategoryBannerResponse = ApiResponse<{
  id: string;
  bannerUrl: string;
  uploadedAt: Date;
}>;
