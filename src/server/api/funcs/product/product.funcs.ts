import { type SupabaseClient } from "@supabase/supabase-js";
import type { DBClient } from "~/server/db/src/client";
import { ProductsTable } from "~/server/db/src/schema/product";
import { v7 as uuidv7 } from "uuid";
import { eq, gt, and, desc, asc, sql } from "drizzle-orm";
import type {
  GetProductsInput,
  GetProductByIdInput,
  GetProductsByCategoryInput,
  CreateProductInput,
  UpdateProductInput,
  UpdateProductStockInput,
  DeleteProductInput,
  UploadProductImageInput,
} from "./product.types";
import { TRPCError } from "@trpc/server";

// Listar produtos disponíveis
export const getProducts = async (input: GetProductsInput, db: DBClient) => {
  try {
    // Construir o filtro
    let filter = undefined;

    if (input.inStock) {
      filter = gt(ProductsTable.stockQuantity, 0);
    }

    // Buscar produtos com paginação
    const products = await db.query.ProductsTable.findMany({
      where: filter,
      with: {
        _category: true,
      },
      limit: input.limit,
      offset: input.offset,
      orderBy: [desc(ProductsTable.updatedAt)],
    });

    // Contar o total de produtos
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(ProductsTable)
      .where(filter ?? undefined);

    const total = countResult[0]?.count ?? 0;

    return {
      products,
      pagination: {
        total,
        limit: input.limit,
        offset: input.offset,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao buscar produtos",
      cause: error,
    });
  }
};

// Obter detalhes de um produto
export const getProductById = async (
  input: GetProductByIdInput,
  db: DBClient,
) => {
  try {
    const product = await db.query.ProductsTable.findFirst({
      where: (products, { eq }) => eq(products.id, input.id),
      with: {
        _category: true,
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: product,
    };
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return {
      success: false,
      error: "Failed to fetch product",
      data: null,
    };
  }
};

// Listar produtos por categoria
export const getProductsByCategory = async (
  input: GetProductsByCategoryInput,
  db: DBClient,
) => {
  try {
    // Verificar se a categoria existe
    const category = await db.query.CategoriesTable.findFirst({
      where: (categories, { eq }) => eq(categories.id, input.categoryId),
    });

    if (!category) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Categoria não encontrada",
      });
    }

    // Construir o filtro
    const conditions = [eq(ProductsTable.categoryId, input.categoryId)];

    if (input.inStock) {
      conditions.push(gt(ProductsTable.stockQuantity, 0));
    }

    const filter = and(...conditions);

    // Buscar produtos com paginação
    const products = await db.query.ProductsTable.findMany({
      where: filter,
      with: {
        _category: true,
      },
      limit: input.limit,
      offset: input.offset,
      orderBy: [asc(ProductsTable.name)],
    });

    // Contar o total de produtos
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(ProductsTable)
      .where(filter);

    const total = countResult[0]?.count ?? 0;

    return {
      category,
      products,
      pagination: {
        total,
        limit: input.limit,
        offset: input.offset,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar produtos por categoria:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao buscar produtos por categoria",
      cause: error,
    });
  }
};

// Criar um novo produto
export const createProduct = async (
  input: CreateProductInput,
  db: DBClient,
) => {
  try {
    // Verificar se a categoria existe se categoryId foi fornecido
    if (input.categoryId) {
      const category = await db.query.CategoriesTable.findFirst({
        where: (categories, { eq }) => eq(categories.id, input.categoryId!),
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Categoria não encontrada",
        });
      }
    }

    // Criar o produto
    const productId = uuidv7();

    const [newProduct] = await db
      .insert(ProductsTable)
      .values({
        id: productId,
        name: input.name,
        description: input.description ?? null,
        price: String(input.price), // Converter para string para compatibilidade com o tipo numeric
        stockQuantity: input.stockQuantity ?? 0,
        categoryId: input.categoryId ?? null,
        imageUrl: input.imageUrl ?? null,
      })
      .returning();

    return newProduct;
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao criar o produto",
      cause: error,
    });
  }
};

// Atualizar produto
export const updateProduct = async (
  input: UpdateProductInput,
  db: DBClient,
) => {
  try {
    // Verificar se o produto existe
    const existingProduct = await db.query.ProductsTable.findFirst({
      where: (products, { eq }) => eq(products.id, input.id),
    });

    if (!existingProduct) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Produto não encontrado",
      });
    }

    // Verificar se a categoria existe se foi fornecida
    if (input.categoryId !== undefined) {
      // Se categoryId for null, permitimos definir como null
      // Caso contrário, verificamos se a categoria existe
      if (input.categoryId !== null) {
        const category = await db.query.CategoriesTable.findFirst({
          where: (categories, { eq }) => eq(categories.id, input.categoryId!),
        });

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Categoria não encontrada",
          });
        }
      }
    }

    // Preparar dados para atualização
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.price !== undefined) updateData.price = String(input.price); // Converter para string
    if (input.categoryId !== undefined)
      updateData.categoryId = input.categoryId;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;

    // Atualizar o produto
    const [updatedProduct] = await db
      .update(ProductsTable)
      .set(updateData)
      .where(eq(ProductsTable.id, input.id))
      .returning();

    return updatedProduct;
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao atualizar o produto",
      cause: error,
    });
  }
};

// Atualizar estoque de um produto
export const updateProductStock = async (
  input: UpdateProductStockInput,
  db: DBClient,
) => {
  try {
    // Verificar se o produto existe
    const existingProduct = await db.query.ProductsTable.findFirst({
      where: (products, { eq }) => eq(products.id, input.id),
    });

    if (!existingProduct) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Produto não encontrado",
      });
    }

    // Atualizar estoque
    const [updatedProduct] = await db
      .update(ProductsTable)
      .set({
        stockQuantity: input.stockQuantity,
        updatedAt: new Date(),
      })
      .where(eq(ProductsTable.id, input.id))
      .returning();

    return updatedProduct;
  } catch (error) {
    console.error("Erro ao atualizar estoque do produto:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao atualizar estoque do produto",
      cause: error,
    });
  }
};

// Excluir um produto
export const deleteProduct = async (
  input: DeleteProductInput,
  db: DBClient,
) => {
  try {
    // Verificar se o produto existe
    const existingProduct = await db.query.ProductsTable.findFirst({
      where: (products, { eq }) => eq(products.id, input.id),
    });

    if (!existingProduct) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Produto não encontrado",
      });
    }

    // Excluir o produto
    await db.delete(ProductsTable).where(eq(ProductsTable.id, input.id));

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao excluir o produto",
      cause: error,
    });
  }
};

// Fazer upload da imagem do produto
export const uploadProductImage = async (
  input: UploadProductImageInput,
  db: DBClient,
  supabase: SupabaseClient,
) => {
  try {
    // Verificar se o produto existe
    const existingProduct = await db.query.ProductsTable.findFirst({
      where: (products, { eq }) => eq(products.id, input.id),
    });

    if (!existingProduct) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Produto não encontrado",
      });
    }

    // Verificar se um arquivo foi fornecido
    if (!input.imageData) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Nenhuma imagem fornecida",
      });
    }

    // Validar o formato base64
    if (
      typeof input.imageData !== "string" ||
      !input.imageData.startsWith("data:")
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Formato de imagem inválido. Esperado string base64 com prefixo data:image",
      });
    }

    // Processar a string base64 de forma segura
    const parts = input.imageData.split(",");
    if (parts.length !== 2) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Formato de imagem inválido",
      });
    }

    // Extrair o tipo de conteúdo
    const mimeTypePart = parts[0];
    const mimeTypeMatch = mimeTypePart
      ? /^data:([^;]+);base64$/.exec(mimeTypePart)
      : null;

    if (!mimeTypeMatch) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Tipo de mídia inválido",
      });
    }

    const contentType = mimeTypeMatch[1];

    // Verificar se é uma imagem
    if (!contentType?.startsWith("image/")) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "O arquivo deve ser uma imagem",
      });
    }

    // Dados base64
    const base64Data = parts[1];
    const buffer = Buffer.from(base64Data ?? "", "base64");

    // Definir extensão do arquivo
    const fileExtension = contentType?.split("/")[1] ?? "png";
    const fileName = `${input.filename}-${Date.now()}.${fileExtension}`;
    const filePath = `produtos/${fileName}`;

    // Fazer upload para o Supabase
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error || !data) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao fazer upload da imagem",
        cause: error,
      });
    }

    // Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    // Atualizar URL da imagem no produto
    const [updatedProduct] = await db
      .update(ProductsTable)
      .set({
        imageUrl: urlData.publicUrl,
        updatedAt: new Date(),
      })
      .where(eq(ProductsTable.id, input.id))
      .returning();

    return updatedProduct;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem do produto:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao fazer upload da imagem do produto",
      cause: error,
    });
  }
};
