import type { DBClient } from "~/server/db/src/client";
import { CategoriesTable } from "~/server/db/src/schema/category";
import { ProductsTable } from "~/server/db/src/schema/product";
import { v7 as uuidv7 } from "uuid";
import { eq, desc, asc, sql } from "drizzle-orm";
import type {
  GetCategoriesInput,
  GetCategoryByIdInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  DeleteCategoryInput,
} from "./category.types";
import { TRPCError } from "@trpc/server";

// Listar todas as categorias
export const getCategories = async (
  input: GetCategoriesInput,
  db: DBClient,
) => {
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

    return {
      categories,
      pagination: {
        total,
        limit: input.limit,
        offset: input.offset,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao buscar categorias",
      cause: error,
    });
  }
};

// Obter detalhes de uma categoria
export const getCategoryById = async (
  input: GetCategoryByIdInput,
  db: DBClient,
) => {
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
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Categoria não encontrada",
      });
    }

    // Contar total de produtos na categoria
    const productCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(ProductsTable)
      .where(eq(ProductsTable.categoryId, input.id));

    const productCount = productCountResult[0]?.count ?? 0;

    return {
      ...category,
      productCount,
    };
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao buscar detalhes da categoria",
      cause: error,
    });
  }
};

// Criar nova categoria
export const createCategory = async (
  input: CreateCategoryInput,
  db: DBClient,
) => {
  try {
    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategory = await db.query.CategoriesTable.findFirst({
      where: (categories, { eq }) => eq(categories.name, input.name),
    });

    if (existingCategory) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Já existe uma categoria com este nome",
      });
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

    return newCategory;
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao criar categoria",
      cause: error,
    });
  }
};

// Atualizar categoria
export const updateCategory = async (
  input: UpdateCategoryInput,
  db: DBClient,
) => {
  try {
    // Verificar se a categoria existe
    const existingCategory = await db.query.CategoriesTable.findFirst({
      where: (categories, { eq }) => eq(categories.id, input.id),
    });

    if (!existingCategory) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Categoria não encontrada",
      });
    }

    // Se o nome estiver sendo atualizado, verificar se já existe outra categoria com o mesmo nome
    if (input.name && input.name !== existingCategory.name) {
      const duplicateCategory = await db.query.CategoriesTable.findFirst({
        where: (categories, { eq, and, ne }) =>
          and(eq(categories.name, input.name!), ne(categories.id, input.id)),
      });

      if (duplicateCategory) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe outra categoria com este nome",
        });
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

    return updatedCategory;
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao atualizar categoria",
      cause: error,
    });
  }
};

// Excluir categoria
export const deleteCategory = async (
  input: DeleteCategoryInput,
  db: DBClient,
) => {
  try {
    // Verificar se a categoria existe
    const existingCategory = await db.query.CategoriesTable.findFirst({
      where: (categories, { eq }) => eq(categories.id, input.id),
    });

    if (!existingCategory) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Categoria não encontrada",
      });
    }

    // Verificar se existem produtos usando esta categoria
    const productsUsingCategory = await db.query.ProductsTable.findFirst({
      where: (products, { eq }) => eq(products.categoryId, input.id),
    });

    if (productsUsingCategory) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Não é possível excluir esta categoria porque existem produtos associados a ela",
      });
    }

    // Excluir a categoria
    await db.delete(CategoriesTable).where(eq(CategoriesTable.id, input.id));

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao excluir categoria",
      cause: error,
    });
  }
};
