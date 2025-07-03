import type { DBClient } from "~/server/db/src/client";
import { CategoriesTable } from "~/server/db/src/schema/category";
import { ProductsTable } from "~/server/db/src/schema/product";
import { v7 as uuidv7 } from "uuid";
import { eq, desc, asc, sql, ilike } from "drizzle-orm";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  GetCategoriesInput,
  GetCategoryByIdInput,
  GetCategoryBySlugInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  DeleteCategoryInput,
  UploadCategoryBannerInput,
  GetCategoryBySlugResponse,
  GetCategoriesResponse,
  GetCategoryByIdResponse,
  CreateCategoryResponse,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
  UploadCategoryBannerResponse,
} from "./category.types";
import { TRPCError } from "@trpc/server";

// Listar todas as categorias
export const getCategories = async (
  input: GetCategoriesInput,
  db: DBClient,
  supabase?: SupabaseClient,
): Promise<GetCategoriesResponse> => {
  try {
    // Buscar categorias com paginação
    const categories = await db.query.CategoriesTable.findMany({
      limit: input.limit,
      offset: input.offset,
      orderBy: [asc(CategoriesTable.name)],
    });

    // Contar o total de categorias
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(CategoriesTable);

    const total = countResult[0]?.count ?? 0;

    // Adicionar URL do banner para cada categoria (se Supabase estiver disponível)
    const categoriesWithBanner = await Promise.all(
      categories.map(async (category) => {
        let bannerUrl = null;
        if (supabase) {
          bannerUrl = await checkCategoryBanner(category.id, supabase);
        }
        return {
          ...category,
          bannerUrl: bannerUrl ?? getCategoryBannerUrl(category.id),
        };
      }),
    );

    return {
      success: true,
      data: {
        categories: categoriesWithBanner,
        pagination: {
          total,
          limit: input.limit,
          offset: input.offset,
        },
      },
    };
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao buscar categorias",
      },
    };
  }
};

// Helper function para converter slug para nome de categoria
const slugToCategoryName = (slug: string): string => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Obter categoria por slug
export const getCategoryBySlug = async (
  input: GetCategoryBySlugInput,
  db: DBClient,
  supabase?: SupabaseClient,
): Promise<GetCategoryBySlugResponse> => {
  try {
    // Converter slug para nome de categoria
    const categoryName = slugToCategoryName(input.slug);

    // Buscar categoria pelo nome (case insensitive)
    const category = await db.query.CategoriesTable.findFirst({
      where: (categories, { ilike }) => ilike(categories.name, categoryName),
      with: {
        _products: {
          limit: 10,
          orderBy: [desc(ProductsTable.updatedAt)],
        },
      },
    });

    if (!category) {
      return {
        success: true,
        data: null,
      };
    }

    // Contar total de produtos na categoria
    const productCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(ProductsTable)
      .where(eq(ProductsTable.categoryId, category.id));

    const productCount = productCountResult[0]?.count ?? 0;

    // Verificar se há banner real
    let bannerUrl = null;
    if (supabase) {
      bannerUrl = await checkCategoryBanner(category.id, supabase);
    }

    return {
      success: true,
      data: {
        ...category,
        productCount,
        bannerUrl: bannerUrl ?? getCategoryBannerUrl(category.id),
      },
    };
  } catch (error) {
    console.error("Erro ao buscar categoria por slug:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao buscar categoria por slug",
      },
    };
  }
};

// Obter detalhes de uma categoria
export const getCategoryById = async (
  input: GetCategoryByIdInput,
  db: DBClient,
  supabase?: SupabaseClient,
): Promise<GetCategoryByIdResponse> => {
  try {
    // Buscar categoria pelo ID
    const category = await db.query.CategoriesTable.findFirst({
      where: (categories, { eq }) => eq(categories.id, input.id),
      with: {
        _products: {
          limit: 10,
          orderBy: [desc(ProductsTable.updatedAt)],
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Categoria não encontrada",
        },
      };
    }

    // Contar total de produtos na categoria
    const productCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(ProductsTable)
      .where(eq(ProductsTable.categoryId, input.id));

    const productCount = productCountResult[0]?.count ?? 0;

    // Verificar se há banner real
    let bannerUrl = null;
    if (supabase) {
      bannerUrl = await checkCategoryBanner(category.id, supabase);
    }

    return {
      success: true,
      data: {
        ...category,
        productCount,
        bannerUrl: bannerUrl ?? getCategoryBannerUrl(category.id),
      },
    };
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao buscar detalhes da categoria",
      },
    };
  }
};

// Criar nova categoria
export const createCategory = async (
  input: CreateCategoryInput,
  db: DBClient,
): Promise<CreateCategoryResponse> => {
  try {
    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategory = await db.query.CategoriesTable.findFirst({
      where: (categories, { eq }) => eq(categories.name, input.name),
    });

    if (existingCategory) {
      return {
        success: false,
        error: {
          code: "CONFLICT",
          message: "Já existe uma categoria com este nome",
        },
      };
    }

    // Criar nova categoria
    const categoryId = uuidv7();

    const [newCategory] = await db
      .insert(CategoriesTable)
      .values({
        id: categoryId,
        name: input.name,
        description: input.description ?? null,
      })
      .returning();

    return {
      success: true,
      data: newCategory!,
    };
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao criar categoria",
      },
    };
  }
};

// Atualizar categoria
export const updateCategory = async (
  input: UpdateCategoryInput,
  db: DBClient,
): Promise<UpdateCategoryResponse> => {
  try {
    // Verificar se a categoria existe
    const existingCategory = await db.query.CategoriesTable.findFirst({
      where: (categories, { eq }) => eq(categories.id, input.id),
    });

    if (!existingCategory) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Categoria não encontrada",
        },
      };
    }

    // Se o nome estiver sendo atualizado, verificar se já existe outra categoria com o mesmo nome
    if (input.name && input.name !== existingCategory.name) {
      const duplicateCategory = await db.query.CategoriesTable.findFirst({
        where: (categories, { eq, and, ne }) =>
          and(eq(categories.name, input.name!), ne(categories.id, input.id)),
      });

      if (duplicateCategory) {
        return {
          success: false,
          error: {
            code: "CONFLICT",
            message: "Já existe outra categoria com este nome",
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

    // Atualizar a categoria
    const [updatedCategory] = await db
      .update(CategoriesTable)
      .set(updateData)
      .where(eq(CategoriesTable.id, input.id))
      .returning();

    return {
      success: true,
      data: updatedCategory!,
    };
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao atualizar categoria",
      },
    };
  }
};

// Excluir categoria
export const deleteCategory = async (
  input: DeleteCategoryInput,
  db: DBClient,
): Promise<DeleteCategoryResponse> => {
  try {
    // Verificar se a categoria existe
    const existingCategory = await db.query.CategoriesTable.findFirst({
      where: (categories, { eq }) => eq(categories.id, input.id),
    });

    if (!existingCategory) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Categoria não encontrada",
        },
      };
    }

    // Verificar se existem produtos usando esta categoria
    const productsUsingCategory = await db.query.ProductsTable.findFirst({
      where: (products, { eq }) => eq(products.categoryId, input.id),
    });

    if (productsUsingCategory) {
      return {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message:
            "Não é possível excluir esta categoria porque existem produtos associados a ela",
        },
      };
    }

    // Excluir a categoria
    await db.delete(CategoriesTable).where(eq(CategoriesTable.id, input.id));

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao excluir categoria",
      },
    };
  }
};

// Helper function to generate category banner URL
export const getCategoryBannerUrl = (
  categoryId: string,
  filename?: string,
): string => {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucketName = "categories-banner";

  if (filename) {
    return `${baseUrl}/storage/v1/object/public/${bucketName}/${categoryId}/${filename}`;
  }

  // Return a default banner URL pattern
  return `${baseUrl}/storage/v1/object/public/${bucketName}/${categoryId}/banner.jpg`;
};

// Helper function to check if category banner exists
export const checkCategoryBanner = async (
  categoryId: string,
  supabase: SupabaseClient,
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from("categories-banner")
      .list(categoryId, {
        limit: 1,
      });

    if (error || !data || data.length === 0) {
      return null;
    }

    // Return the first image found
    const firstImage = data[0];
    if (!firstImage) {
      return null;
    }

    return getCategoryBannerUrl(categoryId, firstImage.name);
  } catch (error) {
    console.error("Error checking category banner:", error);
    return null;
  }
};

// Upload category banner
export const uploadCategoryBanner = async (
  input: UploadCategoryBannerInput,
  db: DBClient,
  supabase: SupabaseClient,
): Promise<UploadCategoryBannerResponse> => {
  try {
    console.log("=== Upload Category Banner Started ===");
    console.log("Category ID:", input.id);
    console.log("Filename:", input.filename);
    console.log("ImageData length:", input.imageData?.length);

    // Verificar se a categoria existe
    const existingCategory = await db.query.CategoriesTable.findFirst({
      where: (categories, { eq }) => eq(categories.id, input.id),
    });

    if (!existingCategory) {
      console.log("Category not found:", input.id);
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Category not found",
        },
      };
    }

    console.log("Category found:", existingCategory.name);

    // Verificar se um arquivo foi fornecido
    if (!input.imageData) {
      console.log("No image data provided");
      return {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "No image provided",
        },
      };
    }

    // Validar o formato base64
    if (
      typeof input.imageData !== "string" ||
      !input.imageData.startsWith("data:")
    ) {
      console.log(
        "Invalid image format:",
        typeof input.imageData,
        input.imageData.substring(0, 50),
      );
      return {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message:
            "Invalid image format. Expected base64 string with data:image prefix",
        },
      };
    }

    // Processar a string base64 de forma segura
    const parts = input.imageData.split(",");
    if (parts.length !== 2) {
      console.log("Invalid base64 format - parts length:", parts.length);
      return {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid image format",
        },
      };
    }

    // Extrair o tipo de conteúdo
    const mimeTypePart = parts[0];
    const mimeTypeMatch = mimeTypePart
      ? /^data:([^;]+);base64$/.exec(mimeTypePart)
      : null;

    if (!mimeTypeMatch) {
      console.log("Invalid mime type part:", mimeTypePart);
      return {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid media type",
        },
      };
    }

    const contentType = mimeTypeMatch[1];
    console.log("Content type:", contentType);

    // Verificar se é uma imagem
    if (!contentType?.startsWith("image/")) {
      console.log("Not an image file:", contentType);
      return {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "File must be an image",
        },
      };
    }

    // Dados base64
    const base64Data = parts[1];
    const buffer = Buffer.from(base64Data ?? "", "base64");
    console.log("Buffer size:", buffer.length);

    // Definir extensão do arquivo
    const fileExtension = contentType?.split("/")[1] ?? "png";
    const fileName = `${input.filename}-${Date.now()}.${fileExtension}`;
    const filePath = `${input.id}/${fileName}`;
    console.log("File path:", filePath);

    // Remover banner anterior se existir
    try {
      console.log("Checking for existing banners...");
      const { data: existingFiles, error: listError } = await supabase.storage
        .from("categories-banner")
        .list(input.id);

      if (listError) {
        console.log("Error listing existing files:", listError);
      } else {
        console.log("Existing files:", existingFiles?.length ?? 0);
      }

      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map(
          (file) => `${input.id}/${file.name}`,
        );
        console.log("Removing files:", filesToRemove);
        const { error: removeError } = await supabase.storage
          .from("categories-banner")
          .remove(filesToRemove);

        if (removeError) {
          console.log("Error removing files:", removeError);
        }
      }
    } catch (error) {
      console.log("Error during cleanup:", error);
    }

    // Fazer upload para o Supabase
    console.log("Starting upload to Supabase...");
    const { data, error } = await supabase.storage
      .from("categories-banner")
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    console.log("Upload result - data:", data);
    console.log("Upload result - error:", error);

    if (error || !data) {
      console.log("Upload failed - error details:", error);
      return {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to upload banner image: ${error?.message ?? "Unknown error"}`,
        },
      };
    }

    // Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from("categories-banner")
      .getPublicUrl(filePath);

    console.log("Public URL:", urlData.publicUrl);
    console.log("=== Upload Category Banner Completed ===");

    return {
      success: true,
      data: {
        id: input.id,
        bannerUrl: urlData.publicUrl,
        uploadedAt: new Date(),
      },
    };
  } catch (error) {
    console.error("=== Upload Category Banner Error ===");
    console.error("Error uploading category banner:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to upload category banner: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
    };
  }
};
