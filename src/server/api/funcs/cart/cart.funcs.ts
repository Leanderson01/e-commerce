import type { DBClient } from "~/server/db/src/client";
import { CartsTable } from "~/server/db/src/schema/cart/cart.table";
import { CartItemsTable } from "~/server/db/src/schema/cart/cart-item.table";
import { v7 as uuidv7 } from "uuid";
import { eq } from "drizzle-orm";
import type {
  GetCartInput,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
  ClearCartInput,
} from "./cart.types";
import { TRPCError } from "@trpc/server";

// Função auxiliar para obter ou criar um carrinho
const getOrCreateCart = async (userId: string, db: DBClient) => {
  // Primeiro, verificar se o usuário existe na nossa tabela
  const user = await db.query.UsersTable.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Usuário não encontrado",
    });
  }

  // Verificar se o usuário já tem um carrinho
  let cart = await db.query.CartsTable.findFirst({
    where: (carts, { eq }) => eq(carts.userId, userId),
    with: {
      _items: {
        with: {
          _product: true,
        },
      },
    },
  });

  // Se não tiver, criar um novo carrinho
  if (!cart) {
    const [newCart] = await db
      .insert(CartsTable)
      .values({
        id: uuidv7(),
        userId,
      })
      .returning();

    if (newCart) {
      cart = {
        ...newCart,
        _items: [],
      };
    } else {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao criar carrinho",
      });
    }
  }

  return cart;
};

// Obter carrinho atual do usuário
export const getCart = async (
  _input: GetCartInput,
  userId: string,
  db: DBClient,
) => {
  try {
    const cart = await getOrCreateCart(userId, db);

    // Calcular o valor total do carrinho
    let total = 0;
    if (cart._items && cart._items.length > 0) {
      total = cart._items.reduce(
        (acc, item) => acc + Number(item.unitPrice) * item.quantity,
        0,
      );
    }

    return {
      ...cart,
      total,
    };
  } catch (error) {
    console.error("Erro ao obter carrinho:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao obter o carrinho",
      cause: error,
    });
  }
};

// Adicionar produto ao carrinho
export const addToCart = async (
  input: AddToCartInput,
  userId: string,
  db: DBClient,
) => {
  try {
    // Verificar se o produto existe
    const product = await db.query.ProductsTable.findFirst({
      where: (products, { eq }) => eq(products.id, input.productId),
    });

    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Produto não encontrado",
      });
    }

    // Verificar se o produto tem estoque suficiente
    if (
      product?.stockQuantity != null &&
      product.stockQuantity < input.quantity
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Quantidade insuficiente em estoque",
      });
    }

    // Obter ou criar carrinho
    const cart = await getOrCreateCart(userId, db);

    // Verificar se o produto já está no carrinho
    const existingItem = cart._items.find(
      (item) => item.productId === input.productId,
    );

    if (existingItem) {
      // Se já existe, atualizar a quantidade
      const newQuantity = existingItem.quantity + input.quantity;

      // Verificar novamente o estoque para a quantidade total
      if (
        product?.stockQuantity != null &&
        product.stockQuantity < newQuantity
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Quantidade insuficiente em estoque para o total solicitado",
        });
      }

      // Atualizar item existente
      await db
        .update(CartItemsTable)
        .set({
          quantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(CartItemsTable.id, existingItem.id))
        .returning();

      // Atualizar data de modificação do carrinho
      await db
        .update(CartsTable)
        .set({ updatedAt: new Date() })
        .where(eq(CartsTable.id, cart.id));

      // Obter o carrinho atualizado
      return await getCart({}, userId, db);
    } else {
      // Se não existe, adicionar novo item
      await db
        .insert(CartItemsTable)
        .values({
          id: uuidv7(),
          cartId: cart.id,
          productId: input.productId,
          quantity: input.quantity,
          unitPrice: String(product.price), // Convertendo para string como esperado pelo campo numeric
        })
        .returning();

      // Atualizar data de modificação do carrinho
      await db
        .update(CartsTable)
        .set({ updatedAt: new Date() })
        .where(eq(CartsTable.id, cart.id));

      // Obter o carrinho atualizado
      return await getCart({}, userId, db);
    }
  } catch (error) {
    console.error("Erro ao adicionar produto ao carrinho:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao adicionar produto ao carrinho",
      cause: error,
    });
  }
};

// Atualizar quantidade de um item no carrinho
export const updateCartItem = async (
  input: UpdateCartItemInput,
  userId: string,
  db: DBClient,
) => {
  try {
    // Verificar se o usuário tem um carrinho
    const cart = await db.query.CartsTable.findFirst({
      where: (carts, { eq }) => eq(carts.userId, userId),
      with: {
        _items: true,
      },
    });

    if (!cart) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Carrinho não encontrado",
      });
    }

    // Verificar se o item está no carrinho do usuário
    const cartItem = await db.query.CartItemsTable.findFirst({
      where: (items, { and, eq }) =>
        and(eq(items.id, input.cartItemId), eq(items.cartId, cart.id)),
      with: {
        _product: true,
      },
    });

    if (!cartItem) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Item não encontrado no carrinho",
      });
    }

    // Verificar estoque
    if (
      cartItem._product?.stockQuantity != null &&
      cartItem._product.stockQuantity < input.quantity
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Quantidade insuficiente em estoque",
      });
    }

    // Atualizar quantidade
    await db
      .update(CartItemsTable)
      .set({
        quantity: input.quantity,
        updatedAt: new Date(),
      })
      .where(eq(CartItemsTable.id, input.cartItemId));

    // Atualizar data de modificação do carrinho
    await db
      .update(CartsTable)
      .set({ updatedAt: new Date() })
      .where(eq(CartsTable.id, cart.id));

    // Obter o carrinho atualizado
    return await getCart({}, userId, db);
  } catch (error) {
    console.error("Erro ao atualizar item do carrinho:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao atualizar item do carrinho",
      cause: error,
    });
  }
};

// Remover item do carrinho
export const removeFromCart = async (
  input: RemoveFromCartInput,
  userId: string,
  db: DBClient,
) => {
  try {
    // Verificar se o usuário tem um carrinho
    const cart = await db.query.CartsTable.findFirst({
      where: (carts, { eq }) => eq(carts.userId, userId),
    });

    if (!cart) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Carrinho não encontrado",
      });
    }

    // Verificar se o item está no carrinho do usuário
    const cartItem = await db.query.CartItemsTable.findFirst({
      where: (items, { and, eq }) =>
        and(eq(items.id, input.cartItemId), eq(items.cartId, cart.id)),
    });

    if (!cartItem) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Item não encontrado no carrinho",
      });
    }

    // Remover o item
    await db
      .delete(CartItemsTable)
      .where(eq(CartItemsTable.id, input.cartItemId));

    // Atualizar data de modificação do carrinho
    await db
      .update(CartsTable)
      .set({ updatedAt: new Date() })
      .where(eq(CartsTable.id, cart.id));

    // Obter o carrinho atualizado
    return await getCart({}, userId, db);
  } catch (error) {
    console.error("Erro ao remover item do carrinho:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao remover item do carrinho",
      cause: error,
    });
  }
};

// Limpar o carrinho
export const clearCart = async (
  _input: ClearCartInput,
  userId: string,
  db: DBClient,
) => {
  try {
    // Verificar se o usuário tem um carrinho
    const cart = await db.query.CartsTable.findFirst({
      where: (carts, { eq }) => eq(carts.userId, userId),
    });

    if (!cart) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Carrinho não encontrado",
      });
    }

    // Remover todos os itens do carrinho
    await db.delete(CartItemsTable).where(eq(CartItemsTable.cartId, cart.id));

    // Atualizar data de modificação do carrinho
    await db
      .update(CartsTable)
      .set({ updatedAt: new Date() })
      .where(eq(CartsTable.id, cart.id));

    // Retornar o carrinho vazio
    return await getCart({}, userId, db);
  } catch (error) {
    console.error("Erro ao limpar carrinho:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao limpar o carrinho",
      cause: error,
    });
  }
};
