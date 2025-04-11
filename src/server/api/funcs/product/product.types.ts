import { z } from "zod"

// Schema para listar produtos
export const getProductsSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  inStock: z.boolean().optional().default(true)
})

// Schema para buscar produto por ID
export const getProductByIdSchema = z.object({
  id: z.string().uuid()
})

// Schema para buscar produtos por categoria
export const getProductsByCategorySchema = z.object({
  categoryId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  inStock: z.boolean().optional().default(true)
})

// Schema para criar produto
export const createProductSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1, "Nome do produto é obrigatório"),
  description: z.string().optional(),
  price: z.number().min(0.01, "O preço deve ser maior que zero"),
  stockQuantity: z.number().int().min(0).default(0),
  imageUrl: z.string().optional()
})

// Schema para atualizar produto
export const updateProductSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1, "Nome do produto é obrigatório").optional(),
  description: z.string().optional(),
  price: z.number().min(0.01, "O preço deve ser maior que zero").optional(),
  imageUrl: z.string().optional()
})

// Schema para atualizar estoque do produto
export const updateProductStockSchema = z.object({
  id: z.string().uuid(),
  stockQuantity: z.number().int().min(0)
})

// Schema para excluir produto
export const deleteProductSchema = z.object({
  id: z.string().uuid()
})

// Schema para upload de imagem de produto
export const uploadProductImageSchema = z.object({
  id: z.string().uuid(),
  imageData: z.string(), // base64
  filename: z.string()
})

// Tipos inferidos dos schemas
export type GetProductsInput = z.infer<typeof getProductsSchema>
export type GetProductByIdInput = z.infer<typeof getProductByIdSchema>
export type GetProductsByCategoryInput = z.infer<typeof getProductsByCategorySchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type UpdateProductStockInput = z.infer<typeof updateProductStockSchema>
export type DeleteProductInput = z.infer<typeof deleteProductSchema>
export type UploadProductImageInput = z.infer<typeof uploadProductImageSchema> 