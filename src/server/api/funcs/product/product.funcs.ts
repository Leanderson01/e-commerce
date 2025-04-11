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
      data: {
        products,
        pagination: {
          total,
          limit: input.limit,
          offset: input.offset,
        },
      },
      error: null,
    };
  } catch (error) {
    console.error("Error getting products:", error);
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao buscar produtos",
        cause: error,
      },
    };
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
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Produto não encontrado",
        },
      };
    }

    return {
      data: product,
      error: null,
    };
  } catch (error) {
    console.error("Error getting product:", error);
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao buscar o produto",
        cause: error,
      },
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
      return {
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Categoria não encontrada",
        },
      };
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
      data: {
        category,
        products,
        pagination: {
          total,
          limit: input.limit,
          offset: input.offset,
        },
      },
      error: null,
    };
  } catch (error) {
    console.error("Error getting products by category:", error);
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao buscar produtos por categoria",
        cause: error,
      },
    };
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
        return {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Categoria não encontrada",
          },
        };
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
        stockQuantity: input.stockQuantity,
        categoryId: input.categoryId ?? null,
        imageUrl: input.imageUrl ?? null,
      })
      .returning();

    return {
      data: newProduct,
      error: null,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao criar o produto",
        cause: error,
      },
    };
  }
};

// Atualizar dados do produto
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
      return {
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Produto não encontrado",
        },
      };
    }

    // Verificar se a categoria existe se categoryId foi fornecido
    if (input.categoryId) {
      const category = await db.query.CategoriesTable.findFirst({
        where: (categories, { eq }) => eq(categories.id, input.categoryId!),
      });

      if (!category) {
        return {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Categoria não encontrada",
          },
        };
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

    return {
      data: updatedProduct,
      error: null,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao atualizar o produto",
        cause: error,
      },
    };
  }
};

// Atualizar estoque do produto
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
      return {
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Produto não encontrado",
        },
      };
    }

    // Atualizar o estoque
    const [updatedProduct] = await db
      .update(ProductsTable)
      .set({
        stockQuantity: input.stockQuantity,
        updatedAt: new Date(),
      })
      .where(eq(ProductsTable.id, input.id))
      .returning();

    return {
      data: updatedProduct,
      error: null,
    };
  } catch (error) {
    console.error("Error updating product stock:", error);
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao atualizar o estoque do produto",
        cause: error,
      },
    };
  }
};

// Excluir produto
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
      return {
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Produto não encontrado",
        },
      };
    }

    // Excluir o produto
    await db.delete(ProductsTable).where(eq(ProductsTable.id, input.id));

    return {
      data: { success: true },
      error: null,
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao excluir o produto",
        cause: error,
      },
    };
  }
};

// Upload de imagem de produto
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
      return {
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Produto não encontrado",
        },
      };
    }

    // Validar base64
    const isBase64 = /^data:image\/[a-z]+;base64,/.test(input.imageData);
    if (!isBase64) {
      return {
        data: null,
        error: {
          code: "BAD_REQUEST",
          message: "Formato inválido. É esperado uma string em base64",
        },
      };
    }

    // Extrair os dados da base64
    const base64Data = input.imageData.split(",")[1];

    if (!base64Data) {
      return {
        data: null,
        error: {
          code: "BAD_REQUEST",
          message: "Dados da imagem inválidos",
        },
      };
    }

    // Nome do arquivo único
    const fileExtension = input.filename.split(".").pop() ?? "png";
    const fileName = `${input.id}-${Date.now()}.${fileExtension}`;
    const filePath = `products/${fileName}`;

    // Upload para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, Buffer.from(base64Data, "base64"), {
        contentType: `image/${fileExtension}`,
      });

    if (uploadError || !uploadData) {
      return {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao fazer upload da imagem",
          cause: uploadError,
        },
      };
    }

    // Obter URL pública da imagem usando o caminho do arquivo carregado
    const { data: publicUrl } = supabase.storage
      .from("product-images")
      .getPublicUrl(uploadData.path || filePath);

    // Atualizar o produto com a URL da imagem
    const [updatedProduct] = await db
      .update(ProductsTable)
      .set({
        imageUrl: publicUrl.publicUrl,
        updatedAt: new Date(),
      })
      .where(eq(ProductsTable.id, input.id))
      .returning();

    return {
      data: {
        product: updatedProduct,
        imageUrl: publicUrl.publicUrl,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error uploading product image:", error);
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao fazer upload da imagem do produto",
        cause: error,
      },
    };
  }
};
