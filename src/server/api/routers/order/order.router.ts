import { createTRPCRouter } from "~/server/api/trpc";
import { orderListRouter } from "./order.list.router";
import { orderFormRouter } from "./order.form.router";

export const orderRouter = createTRPCRouter({
  list: orderListRouter,
  form: orderFormRouter,
}); 