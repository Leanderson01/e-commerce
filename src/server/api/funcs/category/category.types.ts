import { z } from "zod";

// Schema para listar todas as categorias
export const getCategoriesSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Schema para obter detalhes de uma categoria
export const getCategoryByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema para criar uma nova categoria
export const createCategorySchema = z.object({
  name: z.string().min(1, "Nome da categoria é obrigatório"),
  description: z.string().optional(),
});

// Schema para atualizar uma categoria
export const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome da categoria é obrigatório").optional(),
  description: z.string().optional(),
});

// Schema para excluir uma categoria
export const deleteCategorySchema = z.object({
  id: z.string().uuid(),
});

// Tipos inferidos dos schemas
export type GetCategoriesInput = z.infer<typeof getCategoriesSchema>;
export type GetCategoryByIdInput = z.infer<typeof getCategoryByIdSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>; 