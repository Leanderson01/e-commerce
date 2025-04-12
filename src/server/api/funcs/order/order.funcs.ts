import type { DBClient } from "~/server/db/src/client";
import { OrdersTable } from "~/server/db/src/schema/order/order.table";
import { OrderItemsTable } from "~/server/db/src/schema/order/order-item.table";
import { CartItemsTable } from "~/server/db/src/schema/cart/cart-item.table";
import { ProductsTable } from "~/server/db/src/schema/product/product.table";
import { v7 as uuidv7 } from "uuid";
import { eq, and, between, desc, sql, gte, lte } from "drizzle-orm";
import type {
  CreateOrderInput,
  GetUserOrdersInput,
  GetOrderByIdInput,
  GetAllOrdersInput,
  DeleteOrderInput,
} from "./order.types";
import { TRPCError } from "@trpc/server";

// Criar pedido a partir do carrinho atual
export const createOrder = async (
  input: CreateOrderInput,
  userId: string,
  db: DBClient,
) => {
  try {
    // Iniciar transação
    return await db.transaction(async (tx) => {
      // Buscar o carrinho do usuário
      const cart = await tx.query.CartsTable.findFirst({
        where: (carts, { eq }) => eq(carts.userId, userId),
        with: {
          _items: {
            with: {
              _product: true,
            },
          },
        },
      });

      if (!cart?._items?.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Carrinho vazio ou não encontrado",
        });
      }

      // Verificar estoque de todos os produtos
      for (const item of cart._items) {
        const product = item._product;

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Produto ID ${item.productId} não encontrado`,
          });
        }

        if ((product.stockQuantity ?? 0) < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Estoque insuficiente para o produto ${product.name}`,
          });
        }
      }

      // Calcular valor total
      const totalAmount = cart._items.reduce(
        (total, item) => total + Number(item.unitPrice) * item.quantity,
        0,
      );

      // Criar o pedido
      const orderId = uuidv7();
      const [newOrder] = await tx
        .insert(OrdersTable)
        .values({
          id: orderId,
          userId,
          totalAmount: totalAmount.toString(),
          status: "pending",
        })
        .returning();

      if (!newOrder) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao criar pedido",
        });
      }

      // Criar os itens do pedido
      for (const item of cart._items) {
        await tx.insert(OrderItemsTable).values({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });

        // Atualizar estoque do produto
        if (item.productId) {
          await tx
            .update(ProductsTable)
            .set({
              stockQuantity: sql`${ProductsTable.stockQuantity} - ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(ProductsTable.id, item.productId));
        }
      }

      // Limpar o carrinho após finalizar o pedido
      await tx.delete(CartItemsTable).where(eq(CartItemsTable.cartId, cart.id));

      return newOrder;
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao criar pedido",
      cause: error,
    });
  }
};

// Listar pedidos do usuário atual
export const getUserOrders = async (
  input: GetUserOrdersInput,
  userId: string,
  db: DBClient,
) => {
  try {
    // Buscar pedidos do usuário com paginação
    const orders = await db.query.OrdersTable.findMany({
      where: (orders, { eq }) => eq(orders.userId, userId),
      limit: input.limit,
      offset: input.offset,
      orderBy: [desc(OrdersTable.orderDate)],
      with: {
        _items: {
          with: {
            _product: true,
          },
        },
      },
    });

    // Contar o total de pedidos do usuário
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(OrdersTable)
      .where(eq(OrdersTable.userId, userId));

    const total = countResult[0]?.count ?? 0;

    return {
      orders,
      pagination: {
        total,
        limit: input.limit,
        offset: input.offset,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar pedidos do usuário:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao buscar pedidos",
      cause: error,
    });
  }
};

// Obter detalhes de um pedido
export const getOrderById = async (
  input: GetOrderByIdInput,
  userId: string,
  isAdmin: boolean,
  db: DBClient,
) => {
  try {
    // Buscar pedido pelo ID
    const order = await db.query.OrdersTable.findFirst({
      where: (orders, { eq, and }) => {
        // Se não for admin, verifica se o pedido pertence ao usuário
        if (!isAdmin) {
          return and(eq(orders.id, input.id), eq(orders.userId, userId));
        }
        return eq(orders.id, input.id);
      },
      with: {
        _items: {
          with: {
            _product: true,
          },
        },
        _user: true,
      },
    });

    if (!order) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Pedido não encontrado",
      });
    }

    return order;
  } catch (error) {
    console.error("Erro ao buscar detalhes do pedido:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao buscar detalhes do pedido",
      cause: error,
    });
  }
};

// Listar todos os pedidos (admin)
export const getAllOrders = async (input: GetAllOrdersInput, db: DBClient) => {
  try {
    // Montar condições de filtro
    const whereConditions = [];

    if (input.userId) {
      whereConditions.push(eq(OrdersTable.userId, input.userId));
    }

    if (input.status) {
      whereConditions.push(eq(OrdersTable.status, input.status));
    }

    if (input.startDate && input.endDate) {
      whereConditions.push(
        between(
          OrdersTable.orderDate,
          new Date(input.startDate),
          new Date(input.endDate),
        ),
      );
    } else if (input.startDate) {
      whereConditions.push(
        gte(OrdersTable.orderDate, new Date(input.startDate)),
      );
    } else if (input.endDate) {
      whereConditions.push(lte(OrdersTable.orderDate, new Date(input.endDate)));
    }

    // Montar a consulta
    const orders = await db.query.OrdersTable.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      limit: input.limit,
      offset: input.offset,
      orderBy: [desc(OrdersTable.orderDate)],
      with: {
        _user: true,
        _items: {
          with: {
            _product: true,
          },
        },
      },
    });

    // Contar o total de pedidos
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(OrdersTable);

    if (whereConditions.length > 0) {
      countQuery.where(and(...whereConditions));
    }

    const countResult = await countQuery;
    const total = countResult[0]?.count ?? 0;

    return {
      orders,
      pagination: {
        total,
        limit: input.limit,
        offset: input.offset,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar todos os pedidos:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao buscar pedidos",
      cause: error,
    });
  }
};

// Remover um pedido (admin)
export const deleteOrder = async (input: DeleteOrderInput, db: DBClient) => {
  try {
    // Buscar o pedido para garantir que existe
    const order = await db.query.OrdersTable.findFirst({
      where: (orders, { eq }) => eq(orders.id, input.id),
      with: {
        _items: true,
      },
    });

    if (!order) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Pedido não encontrado",
      });
    }

    // Remover o pedido (em transação para garantir consistência)
    return await db.transaction(async (tx) => {
      // Restaurar o estoque dos produtos
      for (const item of order._items) {
        if (item.productId) {
          await tx
            .update(ProductsTable)
            .set({
              stockQuantity: sql`${ProductsTable.stockQuantity} + ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(ProductsTable.id, item.productId));
        }
      }

      // Os itens do pedido serão excluídos automaticamente devido à cláusula ON DELETE CASCADE

      // Excluir o pedido
      const [deletedOrder] = await tx
        .delete(OrdersTable)
        .where(eq(OrdersTable.id, input.id))
        .returning();

      return deletedOrder;
    });
  } catch (error) {
    console.error("Erro ao remover pedido:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao remover pedido",
      cause: error,
    });
  }
};
